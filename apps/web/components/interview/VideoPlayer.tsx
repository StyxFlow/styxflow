"use client";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
const VideoPlayer = ({ publicId }: { publicId: string }) => {
  return (
    <div className="max-w-[30vw] block mx-auto ">
      <CldVideoPlayer
        width="1920"
        height="1080"
        className="rounded-3xl  h-auto shadow-lg"
        src={publicId}
        showJumpControls={true}
        controls={true}
        logo={false}
        poster={
          "https://media.istockphoto.com/id/1473387211/vector/voice-assistant-concept-vector-sound-wave.jpg?s=612x612&w=0&k=20&c=5gExCBxakdXTV5cwkdoAoasWAaILLLK7PGU3wuozbz8="
        }
        colors={{
          base: "#000000",
          text: "#FFFFFF",
          accent: "#4a7199", // Your brand color
        }}
      />
    </div>
  );
};

export default VideoPlayer;
