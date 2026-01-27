import { Button } from '@components/ui/button';

export function ShadcnExample() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          shadcn/ui Button
        </h1>
        <p className="text-slate-600 mb-8">
          Copy-paste component working with Tailwind + Radix UI
        </p>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Variants
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Sizes</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">XS</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              States
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button>Enabled</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            Developers can copy shadcn components to{' '}
            <code className="bg-green-100 px-2 py-1 rounded text-xs">
              apps/frontend/src/components/ui/
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
