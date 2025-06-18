import AuthButton from './AuthButton';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-800">
      <h1 className="text-xl font-bold">DOW Protocol</h1>
      <AuthButton />
    </header>
  );
}
