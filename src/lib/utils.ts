import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula a idade a partir de uma data de nascimento.
 * @param birthDate - A data de nascimento no formato string (ex: 'YYYY-MM-DD').
 * @returns A idade em anos como string (ex: "10 anos") ou uma string vazia se a data for inválida.
 */
export const calculateAge = (birthDate: string | null | undefined): string => {
  if (!birthDate) return '';
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  if (isNaN(birthDateObj.getTime())) return ''; // Verifica se a data é válida
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return `${age} anos`;
};