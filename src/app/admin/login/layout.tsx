/**
 * Login Layout - No auth required for this page
 * Overrides parent admin layout to allow unauthenticated access
 */

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
