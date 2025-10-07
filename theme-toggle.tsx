import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
    </>
  )
}