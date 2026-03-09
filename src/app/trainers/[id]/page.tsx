import { notFound } from "next/navigation";

// Trainer profiles are not yet backed by real data.
// Redirect to the directory page which shows a coming-soon state.
export default function TrainerProfilePage() {
  notFound();
}
