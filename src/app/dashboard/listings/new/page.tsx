import { Metadata } from "next";
import { ListingWizard } from "./wizard";

export const metadata: Metadata = {
  title: "New Listing",
};

export default function NewListingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-black">
          Create a New Listing
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Walk through each section to build a complete, trust-worthy listing.
          More documentation = higher completeness score.
        </p>
      </div>
      <ListingWizard />
    </div>
  );
}
