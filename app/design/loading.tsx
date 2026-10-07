import { BrandLoader } from "@/components/brand/BrandLoader";

/** Route-level loading state: the signature self-drawing logo. */
export default function DesignLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <BrandLoader size={96} label="Loading the design system" />
    </div>
  );
}
