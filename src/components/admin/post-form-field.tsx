import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PostFormField({
  label,
  name,
  defaultValue,
  error,
  tag,
  type = "text",
  min,
  max,
  accept,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  tag?: "textarea";
  type?: string;
  min?: string;
  max?: string;
  accept?: string;
  required?: boolean;
}) {
  const id = `post-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {tag === "textarea" ? (
        <Textarea
          id={id}
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={4}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          accept={accept}
          min={min}
          max={max}
          defaultValue={type === "file" ? undefined : defaultValue ?? ""}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && <PostFormError id={`${id}-error`} text={error} />}
    </div>
  );
}

export function PostFormError({ id, text }: { id?: string; text: string }) {
  return (
    <p className="field-error" id={id} role="alert">
      {text}
    </p>
  );
}
