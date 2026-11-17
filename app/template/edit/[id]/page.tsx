import ConsultantEditor from "@/components/ConsultantEditor"

export default async function EditConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ConsultantEditor id={id} />
}
