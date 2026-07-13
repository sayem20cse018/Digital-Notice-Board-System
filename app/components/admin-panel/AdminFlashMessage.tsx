type Props = {
  type: "success" | "error";
  text: string;
};

export default function AdminFlashMessage({ type, text }: Props) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${
        type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {text}
    </div>
  );
}
