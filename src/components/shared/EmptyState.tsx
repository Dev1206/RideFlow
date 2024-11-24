interface EmptyStateProps {
  message: string;
  description: string;
  icon: React.ReactNode;
}

export const EmptyState = ({ message, description, icon }: EmptyStateProps) => (
  <div className="text-center py-12 bg-white rounded-xl">
    <div className="mx-auto mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
); 