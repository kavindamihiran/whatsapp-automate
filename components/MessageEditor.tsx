"use client";

import { TextAreaWithUpload } from "./TextAreaWithUpload";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function MessageEditor({ value, onChange, placeholder }: Props) {
  return (
    <TextAreaWithUpload
      label="Message"
      hint="The same message is prepared for every recipient"
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? "Type your message here..."}
      rows={8}
      accept=".txt"
      fileHint="TXT supported"
    />
  );
}
