import { useRef, useState } from "react";
import RecordRTC from "recordrtc";
import Waveform from "@/components/Waveform";

const AudioRecorder = () => {
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const recorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: isSafari ? "audio/mp4" : "audio/webm",
    });

    recorder.startRecording();

    recorderRef.current = recorder;
    streamRef.current = stream;
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stopRecording(() => {
      const blob = recorderRef.current!.getBlob();
      setAudioURL(URL.createObjectURL(blob));
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start
      </button>

      <button onClick={stopRecording} disabled={!recording}>
        Stop
      </button>

      {/* 🎵 Wave Animation */}
      {recording && (
        <Waveform
          stream={streamRef.current}
          isRecording={recording}
        />
      )}

      {audioURL && <audio src={audioURL} controls />}
    </div>
  );
};

export default AudioRecorder;
