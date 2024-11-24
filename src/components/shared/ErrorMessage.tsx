interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div className="text-center text-red-600 p-4">
    {message}
  </div>
); 