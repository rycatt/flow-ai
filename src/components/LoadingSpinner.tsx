export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 gray-blue-600"></div>
      <span className="text-gray-600 font-medium">Generating flowchart...</span>
    </div>
  );
};
