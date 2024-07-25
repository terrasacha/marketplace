import { Alert } from "flowbite-react";

export default function AlertMessage({
  type,
  title,
  message,
  visible,
}: {
  type: string;
  title: string;
  message: string;
  visible: boolean | unknown;
}) {
  return (
    <>
      {visible ? (
        <Alert className="py-2" color={type}>
          <span className="font-medium">{title} </span>
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Alert>
      ) : (
        ""
      )}
    </>
  );
}
