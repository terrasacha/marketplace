import React, { Component } from "react";
import { S3 } from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";

interface PQRFormState {
  prqDescription: string;
  prqImage: File | null;
  prqEmail: string;
  showModal: boolean;
  modalMessage: string;
  modalType: "success" | "error" | "";
  isAuthenticated: boolean;
}

export default class PQRForm extends Component<{}, PQRFormState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      prqDescription: "",
      prqImage: null,
      prqEmail: "",
      showModal: false,
      modalMessage: "",
      modalType: "",
      isAuthenticated: false,
    };
  }

  async componentDidMount() {
    try {
      const session = await fetchAuthSession();
      this.setState({ isAuthenticated: true });
    } catch (error) {
      console.error("No hay sesión activa:", error);
      window.location.href = "/";
    }
  }

  handlePRQSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { prqDescription, prqImage, prqEmail } = this.state;
  
    let imageUrl: string | null = null;
  
    // Validar y subir la imagen si existe
    if (prqImage) {
      const maxFileSize = 15 * 1024 * 1024; // 15 MB en bytes
      if (prqImage.size > maxFileSize) {
        alert("El tamaño máximo permitido para la imagen es de 15 MB.");
        return;
      }
  
      // Leer el bucket y la región desde las variables de entorno
      const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
      const bucketRegion = process.env.REACT_APP_S3_BUCKET_REGION;
  
      if (!bucketName || !bucketRegion) {
        console.error("El nombre del bucket o la región no están configurados en las variables de entorno.");
        alert("Error de configuración. Contacta al administrador del sistema.");
        return;
      }
  
      const fileName = `prq-images/${Date.now()}_${prqImage.name}`;
  
      try {
        const s3 = new S3({
          region: bucketRegion,
        });
  
        const result = await s3.upload({
          Bucket: bucketName, // Nombre del bucket desde la variable de entorno
          Key: fileName,
          Body: prqImage,
          ContentType: prqImage.type,
          ACL: "public-read", // Permiso de lectura pública
        }).promise();
  
        imageUrl = result.Location;
      } catch (error) {
        console.error("Error al subir la imagen a S3:", error);
        alert("Hubo un error al subir la imagen. Inténtalo de nuevo.");
        return;
      }
    }
  
    // Construir el cuerpo de la solicitud
    const requestBody = {
      prqDescription,
      imageUrl,
      prqEmail,
    };
  
    try {
      const response = await fetch("https://4e2uo1y7p0.execute-api.us-east-1.amazonaws.com/prod/pqr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        this.setState({
          showModal: true,
          modalMessage: "Tu PQR se envió exitosamente.",
          modalType: "success",
          prqDescription: "",
          prqImage: null,
          prqEmail: "",
        });
      } else {
        this.setState({
          showModal: true,
          modalMessage: "Hubo un error al enviar el PQR. Inténtalo de nuevo.",
          modalType: "error",
        });
      }
    } catch (error) {
      console.error("Error enviando el PQR:", error);
      this.setState({
        showModal: true,
        modalMessage: "Hubo un error al enviar el PQR. Inténtalo de nuevo.",
        modalType: "error",
      });
    }
  };
  

  closeModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { showModal, modalMessage, modalType, prqDescription, prqEmail, isAuthenticated } = this.state;

    if (!isAuthenticated) {
      return (
        <div>
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Acceso Restringido</h5>
                  <button type="button" className="close" onClick={this.closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">{modalMessage}</div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={this.closeModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container-fluid bg-tecnologia p-5" id="tecnologia">
        <div className="container mt-5 p-4">
          <button
            className="btn mb-4"
            style={{
              color: "#1C3541",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => (window.location.href = "/")}
          >
            &larr; Regresar
          </button>

          <h2 className="text-center mb-4">Envía tu PQR</h2>
          <form onSubmit={this.handlePRQSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="prqDescription">Descripción de la consulta</label>
              <textarea
                className="form-control"
                id="prqDescription"
                rows={3}
                value={prqDescription}
                onChange={(e) => this.setState({ prqDescription: e.target.value })}
                required
                minLength={15}
                placeholder="Describe detalladamente tu consulta"
              ></textarea>
              <small className="form-text text-muted">
                La descripción debe tener al menos 15 caracteres.
              </small>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="prqImage">Imagen (opcional)</label>
              <input
                type="file"
                className="form-control-file"
                id="prqImage"
                accept="image/png, image/jpeg, image/jpg, image/gif"
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  if (file) {
                    if (!["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(file.type)) {
                      alert("Solo se aceptan imágenes en formato PNG, JPEG, JPG o GIF.");
                      return;
                    }
                  }
                  this.setState({ prqImage: file });
                }}
              />
              <small className="form-text text-muted">
                Formatos aceptados: PNG, JPEG, JPG, GIF. Tamaño máximo: 15 MB.
              </small>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="prqEmail">Correo de contacto</label>
              <input
                type="email"
                className="form-control"
                id="prqEmail"
                value={prqEmail}
                onChange={(e) => this.setState({ prqEmail: e.target.value })}
                required
                placeholder="Ingresa tu correo electrónico"
              />
            </div>
            <button
              type="submit"
              className="btn w-100 mt-3"
              style={{
                backgroundColor: "#1C3541",
                borderColor: "#1C3541",
                color: "#fff",
              }}
            >
              Enviar PQR
            </button>
          </form>

          <div className={`modal ${showModal ? "show" : ""}`} style={{ display: showModal ? "block" : "none" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{modalType === "success" ? "Éxito" : "Error"}</h5>
                  <button type="button" className="close" onClick={this.closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">{modalMessage}</div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={this.closeModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
