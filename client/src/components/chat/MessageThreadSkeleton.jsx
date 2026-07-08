const MessageThreadSkeleton = () => {
  return (
    <div className="space-y-4 px-5 py-4">
      {Array.from({ length: 6 }).map((_, index) => {
        const isOwnMessage = index % 2 === 1;

        return (
          <div
            key={index}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`space-y-2 rounded-2xl px-4 py-3 ${
                isOwnMessage ? "w-48 bg-primary/10" : "w-56 bg-gray-100"
              }`}
            >
              <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="ml-auto h-2 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageThreadSkeleton;
