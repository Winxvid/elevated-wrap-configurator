import { createFileRoute } from "@tanstack/react-router";
import { Configurator } from "@/components/configurator";

export const Route = createFileRoute("/$")({
  component: Configurator,
});
