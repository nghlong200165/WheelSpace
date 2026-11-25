import { ChatIcon } from "./icons";

// Floating chat button; hidden until a Messenger link is set in the admin settings.
export function MessengerButton({ url }: { url: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-ink px-5 py-3.5 text-[13px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:text-white sm:right-6 sm:bottom-6"
    >
      <ChatIcon />
      Nhắn tin Messenger
    </a>
  );
}
