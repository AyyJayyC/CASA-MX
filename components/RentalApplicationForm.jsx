"use client";
import React, { useState } from "react";
import { z } from "zod";
import DocumentUpload from "./DocumentUpload";
import PersonalSection from "./rental-form/PersonalSection";
import EmploymentSection from "./rental-form/EmploymentSection";
import PreferencesSection from "./rental-form/PreferencesSection";
import ReferencesSection from "./rental-form/ReferencesSection";

const applicationSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  employer: z.string().min(1, "El empleador es requerido"),
  jobTitle: z.string().min(1, "El puesto de trabajo es requerido"),
  monthlyIncome: z.number({ invalid_type_error: "El ingreso mensual debe ser un número" }).positive("El ingreso mensual debe ser mayor a 0"),
  employmentDuration: z.string().min(1, "La duración del empleo es requerida"),
  desiredMoveInDate: z.string().min(1, "La fecha de mudanza es requerida"),
  desiredLeaseTerm: z.number({ invalid_type_error: "El término del contrato debe ser un número" }).int("El término debe ser un número entero").positive("El término debe ser mayor a 0"),
  numberOfOccupants: z.number({ invalid_type_error: "El número de ocupantes debe ser un número" }).int("El número de ocupantes debe ser un número entero").positive("El número de ocupantes debe ser mayor a 0"),
  reference1Name: z.string().min(1, "El nombre de la referencia 1 es requerido"),
  reference1Phone: z.string().min(10, "El teléfono de la referencia 1 debe tener al menos 10 dígitos"),
  reference2Name: z.string().optional(),
  reference2Phone: z.string().optional(),
  offeredMonthlyRent: z.number({ invalid_type_error: "La renta ofrecida debe ser un número" }).positive("La renta ofrecida debe ser mayor a 0").optional(),
  messageToLandlord: z.string().optional(),
});

export default function RentalApplicationForm({ propertyId, monthlyRent, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", employer: "", jobTitle: "",
    monthlyIncome: "", employmentDuration: "", desiredMoveInDate: "",
    desiredLeaseTerm: "", numberOfOccupants: "", reference1Name: "",
    reference1Phone: "", reference2Name: "", reference2Phone: "",
    offeredMonthlyRent: "", messageToLandlord: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [createdApplicationId, setCreatedApplicationId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitStatus(null);
    setSubmitMessage("");

    const dataToValidate = {
      ...formData,
      monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
      desiredLeaseTerm: formData.desiredLeaseTerm ? parseInt(formData.desiredLeaseTerm) : undefined,
      numberOfOccupants: formData.numberOfOccupants ? parseInt(formData.numberOfOccupants) : undefined,
      offeredMonthlyRent: formData.offeredMonthlyRent ? parseFloat(formData.offeredMonthlyRent) : undefined,
    };

    const result = applicationSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/applications`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            ...result.data,
            desiredMoveInDate: new Date(result.data.desiredMoveInDate).toISOString(),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al enviar la solicitud");

      setSubmitStatus("success");
      setSubmitMessage("¡Solicitud enviada exitosamente! El propietario revisará tu aplicación pronto.");
      if (data.application?.id) setCreatedApplicationId(data.application.id);
      setFormData({ fullName: "", email: "", phone: "", employer: "", jobTitle: "", monthlyIncome: "", employmentDuration: "", desiredMoveInDate: "", desiredLeaseTerm: "", numberOfOccupants: "", reference1Name: "", reference1Phone: "", reference2Name: "", reference2Phone: "", offeredMonthlyRent: "", messageToLandlord: "" });
      if (onSuccess) onSuccess(data);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error.message || "Ocurrió un error al enviar la solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {submitStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 text-center">¡Solicitud enviada!</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              El propietario revisará tu aplicación y se pondrá en contacto contigo directamente.
            </p>
            {createdApplicationId && (
              <div className="w-full p-3 rounded-lg border border-clay-200 dark:border-clay-800 bg-clay-50 dark:bg-clay-900/20">
                <h3 className="font-semibold text-clay-800 dark:text-clay-300 mb-3 text-sm">Sube tus documentos</h3>
                <DocumentUpload applicationId={createdApplicationId} />
              </div>
            )}
            <button type="button" onClick={() => { setSubmitStatus(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="mt-2 px-6 py-2.5 bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 text-white font-semibold rounded-lg transition-all text-sm">
              Ver la propiedad
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitStatus === "error" && (
          <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{submitMessage}</p>
            </div>
          </div>
        )}

        <PersonalSection formData={formData} errors={errors} handleChange={handleChange} />
        <EmploymentSection formData={formData} errors={errors} handleChange={handleChange} monthlyRent={monthlyRent} />
        <PreferencesSection formData={formData} errors={errors} handleChange={handleChange} monthlyRent={monthlyRent} />
        <ReferencesSection formData={formData} errors={errors} handleChange={handleChange} />

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
          <div>
            <label htmlFor="messageToLandlord" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Mensaje al Propietario (Opcional)
            </label>
            <textarea id="messageToLandlord" name="messageToLandlord" value={formData.messageToLandlord}
              onChange={handleChange} rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent resize-none"
              placeholder="Cuéntale al propietario por qué eres un buen candidato..." />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isSubmitting}
            className={`w-full px-6 py-3 bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enviando...
              </span>
            ) : "Enviar Solicitud"}
          </button>
          <p className="mt-2 text-xs text-center text-neutral-600 dark:text-neutral-400">
            Al enviar esta solicitud, aceptas compartir tu información con el propietario.
          </p>
        </div>
      </form>
    </>
  );
}
