import clsx from "clsx";
import Container from "./Container";

export default function Section({
  id,
  className,
  children
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={clsx("py-16 md:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}
