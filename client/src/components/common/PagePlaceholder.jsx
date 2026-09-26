export default function PagePlaceholder({
  title,
  description,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
        <p className="text-sm text-gray-400">
          This module will be implemented in a later phase.
        </p>
      </div>
    </div>
  );
}