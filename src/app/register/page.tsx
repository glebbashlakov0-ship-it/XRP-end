import RegisterClient from "./register-client";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ ref?: string }>;
}) {
  const resolvedSearch = searchParams ? await searchParams : {};
  const referralCode = resolvedSearch?.ref?.trim() || "";
  return <RegisterClient referralCode={referralCode} />;
}
