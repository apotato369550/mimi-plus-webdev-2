export default function Content({ variant = "default", children }) {
  return variant === "default" ? (
    <div className="flex flex-col items-center justify-center gap-4 pt-6 pb-[60px] px-[112px]">
      {children}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-4 pt-[112px] px-[112px]">
      {children}
    </div>
  );
}
