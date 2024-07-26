import { Label, TextInput, Textarea, Checkbox, Radio } from "flowbite-react";

export default function FormGroup({
  className,
  inputValue,
  inputSize = "sm",
  label = "",
  inputType = "text",
  inputPlaceholder,
  inputName,
  optionList,
  optionCheckedList = [],
  disabled = false,
  checked,
}: any) {
  function handleInputRenderByInputType(inputType: string) {
    if (
      inputType === "text" ||
      inputType === "number" ||
      inputType === "email" ||
      inputType === "password"
    ) {
      return (
        <TextInput
          disabled={disabled}
          sizing={inputSize}
          type={inputType}
          name={inputName}
          placeholder={inputPlaceholder}
          value={inputValue}
        />
      );
    }
    if (inputType === "textarea") {
      return (
        <Textarea
          disabled={disabled}
          placeholder={inputPlaceholder}
          value={inputValue}
          rows={4}
        />
      );
    }
    if (inputType === "checkbox") {
      return (
        <>
          {optionList.map((option: string, index: number) => (
            <div className="flex items-center gap-2" key={index}>
              <Checkbox
                disabled={disabled}
                value={option}
                checked={optionCheckedList.includes(option)}
              />
              <Label>{option}</Label>
            </div>
          ))}
        </>
      );
    }
    if (inputType === "radio") {
      return (
        <>
          {optionList.map((option: string, index: number) => (
            <div className="flex items-center gap-2" key={index}>
              <Radio
                disabled={disabled}
                value={option}
                checked={optionCheckedList.includes(option)}
              />
              <Label>{option}</Label>
            </div>
          ))}
        </>
      );
    }
  }

  return (
    <div className={className}>
      <Label value={label} />
      {handleInputRenderByInputType(inputType)}
    </div>
  );
}
