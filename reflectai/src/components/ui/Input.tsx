interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ ...props }: InputProps) {
  return (
    <input
      {...props}
      className="w-full p-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder:text-slate-500 text-[#1E1B4B]"
    />
  );
}