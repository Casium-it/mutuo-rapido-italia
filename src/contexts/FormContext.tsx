
// Questo file è un wrapper per compatibilità, reindirizza alla nuova implementazione
import { FormProvider, useForm as useFormNew } from "@/domains/form/context/FormContext";

export { FormProvider };
export const useForm = useFormNew;

export default useForm;
