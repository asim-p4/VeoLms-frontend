/**
 * @fileoverview Course Creation Wizard
 * Multi-step form for creating a new course.
 * 
 * ARCHITECTURE DECISION:
 * Instead of 5 separate pages, we use a single component with internal step state.
 * This ensures all form data is kept in memory (via React Hook Form) until the final submit.
 * 
 * CURRENT IMPLEMENTATION: Only showing Step 1 (Basic Info) for brevity, but the
 * scaffolding supports the full wizard flow.
 */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const basicInfoSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

export function CreateCoursePage() {
  const [step, setStep] = React.useState(1);
  const totalSteps = 4; // 1. Basic, 2. Content, 3. Media, 4. Pricing

  const { register, handleSubmit, formState: { errors } } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema)
  });

  const onNext = (data: BasicInfoData) => {
    console.log('Step 1 Data Saved to memory:', data);
    setStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href="/admin/courses"><ArrowLeft className="h-5 w-5" /></a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary-600 h-full transition-all duration-300" 
          style={{ width: `${(step / totalSteps) * 100}%` }} 
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <Input 
                  {...register('title')} 
                  placeholder="e.g. Advanced React Patterns"
                  className={errors.title ? 'border-error' : ''} 
                />
                {errors.title && <p className="text-error text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea 
                  {...register('description')}
                  className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-error' : 'border-gray-200'}`}
                  rows={4}
                  placeholder="Briefly describe what students will learn..."
                />
                {errors.description && <p className="text-error text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    {...register('category')}
                    className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                  </select>
                  {errors.category && <p className="text-error text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (INR)</label>
                  <Input 
                    type="number" 
                    {...register('price')} 
                    placeholder="e.g. 499" 
                    className={errors.price ? 'border-error' : ''} 
                  />
                  {errors.price && <p className="text-error text-xs mt-1">{errors.price.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" type="button">Save Draft</Button>
                <Button type="submit">Continue to Curriculum <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="py-12 text-center text-gray-500">
              <p>Curriculum builder mock (Drag and Drop UI goes here)</p>
              <Button onClick={() => setStep(1)} className="mt-4" variant="outline">Back to Step 1</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
