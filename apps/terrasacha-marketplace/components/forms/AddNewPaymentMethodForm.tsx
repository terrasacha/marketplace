import React, { useState, useCallback } from 'react';
import countries from '../../lib/countries.json';
import { validarString } from '../../lib/util';
import { error } from 'console';
//import { CardanoWallet } from "@meshsdk/react";
import CardanoWallet from '../cardano-wallet/CardanoWallet';
import { toast } from 'sonner';

interface FuncProps {
  addNewPaymentMethod: (data: any) => void;
}

const AddNewPaymentMethodForm: React.FC<FuncProps> = (props: any) => {
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(
    undefined
  );
  const [data, setData] = useState({
    type: '',
    cardNumber: '',
    cvv: '',
    exMonth: '',
    exYear: '',
    name: '',
    country: '',
    district: '',
    city: '',
    postalCode: '',
    dialCode: '',
    phoneNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    cvv: '',
    exDate: '',
    name: '',
    country: '',
    district: '',
    city: '',
    postalCode: '',
    dialCode: '',
    phoneNumber: '',
    email: '',
  });

  const resetData = async () => {
    setData({
      type: '',
      cardNumber: '',
      cvv: '',
      exMonth: '',
      exYear: '',
      name: '',
      country: '',
      district: '',
      city: '',
      postalCode: '',
      dialCode: '',
      phoneNumber: '',
      email: '',
    });
  };

  const canSubmit = Object.values(errors).every((error) => !error);
  const fullFilledForm = Object.values(data).every((value) => value !== '');

  const handleOnChangeInputForm = async (e: React.FormEvent) => {
    const target = e.target as HTMLFormElement;
    let error: string = '';

    // Expresiones regulares
    const regexInputName: RegExp = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/;
    const regexCardNumber: RegExp =
      /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/;
    const regexCVV: RegExp = /^\d{3}$/;
    const regexDistrict: RegExp = /^[a-zA-Z]{2}$/;
    const regexDialCode: RegExp = /^\+\d+$/;
    const regexPhoneNumber: RegExp = /^\d+$/;

    // Otras variables necesarias para validar
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (target.name === 'type') {
      const updateData = {
        ...data,
        type: target.value,
      };
      setData(updateData);
    }

    if (target.name === 'name') {
      const updateData = {
        ...data,
        name: target.value.toUpperCase(),
      };
      setData(updateData);

      error = target.value ? validarString(target.value, regexInputName) : '';

      const updateErrors = {
        ...errors,
        name: error,
      };
      setErrors(updateErrors);
    }

    if (target.name === 'cardNumber') {
      const updateData = {
        ...data,
        cardNumber: target.value,
      };
      setData(updateData);
    }

    if (target.name === 'exMonth') {
      const updateData = {
        ...data,
        exMonth: target.value,
      };
      setData(updateData);

      if (data.exYear && target.value) {
        error =
          parseInt(data.exYear) < currentYear ||
          (parseInt(data.exYear) === currentYear &&
            parseInt(target.value) <= currentMonth)
            ? 'La tarjeta está expirada.'
            : '';

        const updateErrors = {
          ...errors,
          exDate: error,
        };
        setErrors(updateErrors);
      }
    }

    if (target.name === 'exYear') {
      const updateData = {
        ...data,
        exYear: target.value,
      };
      setData(updateData);

      if (target.value && data.exMonth) {
        error =
          parseInt(target.value) < currentYear ||
          (parseInt(target.value) === currentYear &&
            parseInt(data.exMonth) <= currentMonth)
            ? 'La tarjeta está expirada.'
            : '';

        const updateErrors = {
          ...errors,
          exDate: error,
        };
        setErrors(updateErrors);
      }
    }

    if (target.name === 'cvv') {
      const updateData = {
        ...data,
        cvv: target.value,
      };
      setData(updateData);

      error = target.value ? validarString(target.value, regexCVV) : '';

      const updateErrors = {
        ...errors,
        cvv: error,
      };
      setErrors(updateErrors);
    }

    if (target.name === 'country') {
      const updateData = {
        ...data,
        country: target.value,
      };
      setData(updateData);

      error =
        data.district && ['US', 'CA'].includes(target.value)
          ? validarString(data.district, regexDistrict)
          : '';

      const updateErrors = {
        ...errors,
        district: error,
      };
      setErrors(updateErrors);
    }

    if (target.name === 'city') {
      const updateData = {
        ...data,
        city: target.value.toUpperCase(),
      };
      setData(updateData);
    }

    if (target.name === 'district') {
      const updateData = {
        ...data,
        district: target.value.toUpperCase(),
      };
      setData(updateData);
      error =
        target.value && ['US', 'CA'].includes(data.country)
          ? validarString(target.value, regexDistrict)
          : '';

      const updateErrors = {
        ...errors,
        district: error,
      };
      setErrors(updateErrors);
    }

    if (target.name === 'postalcode') {
      const updateData = {
        ...data,
        postalCode: target.value,
      };
      setData(updateData);
    }

    if (target.name === 'dialcode') {
      const updateData = {
        ...data,
        dialCode: target.value,
      };
      setData(updateData);

      error = target.value ? validarString(target.value, regexDialCode) : '';

      const updateErrors = {
        ...errors,
        dialCode: error,
      };
      setErrors(updateErrors);
    }

    if (target.name === 'phonenumber') {
      const updateData = {
        ...data,
        phoneNumber: target.value,
      };
      setData(updateData);

      error = target.value ? validarString(target.value, regexPhoneNumber) : '';

      const updateErrors = {
        ...errors,
        phoneNumber: error,
      };
      setErrors(updateErrors);
    }

    if (target.name === 'email') {
      const updateData = {
        ...data,
        email: target.value.toUpperCase(),
      };
      setData(updateData);
    }
  };

  const validateCreditCardNumber = async (e: React.FormEvent) => {
    const target = e.target as HTMLFormElement;
    let error: string = '';
    const regexCardNumber: RegExp =
      /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/;

    error = target.value ? validarString(target.value, regexCardNumber) : '';

    const updateErrors = {
      ...errors,
      cardNumber: error,
    };
    setErrors(updateErrors);
  };

  const labelError = 'block text-md font-medium text-red-700 dark:text-red-500';
  const inputError =
    'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500';

  const handleAddNewPaymentMethod = async () => {
    if (fullFilledForm) {
      props.addNewPaymentMethod(data);
      toast.success('Tarjeta de credito creada exitosamente');
      resetData();
      return;
    }

    toast.error('Campos sin resolver');
  };
  return (
    <form className="space-y-3" action="#" id="addNewPaymentMethodForm">
      <div>
        <label className="block mb-2 font-medium text-gray-900 dark:text-white">
          Metodo de pago
        </label>
        <select
          name="type"
          value={data.type}
          onChange={(e) => handleOnChangeInputForm(e)}
          className="bg-gray-50 inline-flex w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="" disabled>
            Escoge tu metodo de pago
          </option>
          <option value="CC">Tarjeta de credito</option>
          <option value="Cardano">Cardano</option>
        </select>
      </div>
      {data.type === 'CC' ? (
        <>
          <div className="border p-4 space-y-3">
            <div>
              <label
                className={
                  errors.name
                    ? labelError
                    : 'block mb-2 text-md font-medium text-gray-900 dark:text-white'
                }
              >
                Name on Card:
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => handleOnChangeInputForm(e)}
                required
                className={
                  errors.name
                    ? inputError
                    : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                }
              />
              {errors.name ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Algo anda mal!</span> Verifica
                  la información del campo.
                </p>
              ) : (
                ''
              )}
            </div>
            <div>
              <label
                className={
                  errors.cardNumber
                    ? labelError
                    : 'block mb-2 text-md font-medium text-gray-900 dark:text-white'
                }
              >
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={data.cardNumber}
                onChange={(e) => handleOnChangeInputForm(e)}
                onBlur={(e) => validateCreditCardNumber(e)}
                placeholder="4007400000000007"
                className={
                  errors.cardNumber
                    ? inputError
                    : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                }
              />
              {errors.cardNumber ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Algo anda mal!</span> Verifica
                  el numero de tu tarjeta
                </p>
              ) : (
                ''
              )}
            </div>
            <div>
              <label
                className={
                  errors.exDate
                    ? labelError
                    : 'block mb-2 text-md font-medium text-gray-900 dark:text-white'
                }
              >
                Expiration date
              </label>
              <div className="flex space-x-3">
                <select
                  name="exMonth"
                  value={data.exMonth}
                  onChange={(e) => handleOnChangeInputForm(e)}
                  required
                  className={
                    errors.exDate
                      ? inputError
                      : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                  }
                >
                  <option value="" disabled>
                    Select month
                  </option>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <select
                  name="exYear"
                  value={data.exYear}
                  onChange={(e) => handleOnChangeInputForm(e)}
                  required
                  className={
                    errors.exDate
                      ? inputError
                      : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                  }
                >
                  <option value="" disabled>
                    Select year
                  </option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
              {errors.exDate ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Algo anda mal!</span> La tarjeta
                  ya expiró.
                </p>
              ) : (
                ''
              )}
            </div>
            <div>
              <label
                className={
                  errors.cvv
                    ? labelError
                    : 'block mb-2 text-md font-medium text-gray-900 dark:text-white'
                }
              >
                CVV
              </label>
              <input
                type="password"
                name="cvv"
                value={data.cvv}
                onChange={(e) => handleOnChangeInputForm(e)}
                placeholder="CVV"
                required
                className={
                  errors.cvv
                    ? inputError
                    : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                }
              />
              {errors.cvv ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Algo anda mal!</span> El campo
                  CVV debe ser un numero de tres digitos
                </p>
              ) : (
                ''
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                Country
              </label>
              <select
                name="country"
                value={data.country}
                onChange={(e) => handleOnChangeInputForm(e)}
                required
                className="bg-gray-50 inline-flex w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="" disabled>
                  Select country
                </option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.text}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <div className="w-full">
                <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={data.city}
                  onChange={(e) => handleOnChangeInputForm(e)}
                  placeholder="City"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <div className="w-full">
                <label
                  className={
                    errors.district
                      ? labelError
                      : 'block mb-2 text-md font-medium text-gray-900 dark:text-white'
                  }
                >
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={data.district}
                  onChange={(e) => handleOnChangeInputForm(e)}
                  placeholder="District"
                  className={
                    errors.district
                      ? inputError
                      : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                  }
                />
                {errors.district ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    <span className="font-medium">Algo anda mal!</span> El campo
                    District deberia tener 2 caracteres
                  </p>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="w-full">
                <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                  Postalcode
                </label>
                <input
                  type="text"
                  name="postalcode"
                  value={data.postalCode}
                  onChange={(e) => handleOnChangeInputForm(e)}
                  placeholder="Postalcode"
                  required
                  className="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <div className="w-full">
                <label
                  className={
                    errors.dialCode || errors.phoneNumber
                      ? labelError
                      : 'block mb-2 text-md font-medium text-gray-900 dark:text-white'
                  }
                >
                  Phone number
                </label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    name="dialcode"
                    value={data.dialCode}
                    onChange={(e) => handleOnChangeInputForm(e)}
                    placeholder="+00"
                    required
                    className={
                      errors.dialCode
                        ? 'w-1/4 ' + inputError
                        : 'w-1/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    }
                  />
                  <input
                    type="text"
                    name="phonenumber"
                    value={data.phoneNumber}
                    onChange={(e) => handleOnChangeInputForm(e)}
                    placeholder="3143153156"
                    className={
                      errors.phoneNumber
                        ? 'w-3/4 ' + inputError
                        : 'w-3/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    }
                  />
                </div>
                {errors.dialCode || errors.phoneNumber ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    <span className="font-medium">Algo anda mal!</span> El
                    formato no corresponde
                  </p>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={data.email}
                onChange={(e) => handleOnChangeInputForm(e)}
                placeholder="contact@suan.global"
                required
                className="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAddNewPaymentMethod()}
            disabled={!canSubmit}
            className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Agregar metodo de pago
          </button>
        </>
      ) : (
        ''
      )}
      {data.type === 'Cardano' ? (
        <div className="border p-4 space-y-3 flex justify-center">
          <CardanoWallet></CardanoWallet>
        </div>
      ) : (
        ''
      )}
    </form>
  );
};

export default AddNewPaymentMethodForm;
