"use client";
import React from "react";
import Detector from "@/components/Detector";
import { Button, ChatBubble, Loading } from "react-daisyui";
import useModel from "@/components/useModel";
import { notFound, useSearchParams } from "next/navigation";
import { FaceMatch } from "face-api.js";
import { useDebounce } from "use-debounce";
import { sendConfirmationMessage, useParents, useStudents } from "@/services";

interface Props {
  params: {
    parent: string;
  };
}

export default function Page({ params }: Props) {
  if (!params.parent) return notFound();
  const { model, loading, error } = useModel(params.parent);
  const [parent, setParent] = React.useState<string>("");
  const [value] = useDebounce(parent, 1000);

  const [response, setResponse] = React.useState<any>(null);
  const [loadingResponse, setLoadingResponse] = React.useState<boolean>(false);
  const [loadingSend, setLoadingSend] = React.useState<boolean>(false);
  const [videoRef, setVideoRef] = React.useState<HTMLVideoElement | null>(null);

  const parents = useParents();
  const students = useStudents();

  const queryParams = useSearchParams();
  const student = queryParams.get("student");

  const parentData = parents.find((p) => p.id === params.parent);
  const studentData = students.find((s) => s.id === student);
  if (parents.length > 0 && !parentData) return notFound();
  if (students.length > 0 && !studentData) return notFound();

  const message = `Yth. Bapak/Ibu ${parentData?.name}, anak Anda *${studentData?.name}* akan dijemput oleh orang yang tidak dikenal. Izinkan? (Y/N)`;

  if (error) return notFound();

  const onMatches = (matches: FaceMatch[]) => {
    if (matches[0]?.label !== parent) {
      setParent(matches[0]?.label);
    }
  };

  const handleSend = async () => {
    // get video frame
    const canvas = document.createElement("canvas");
    canvas.width = videoRef!.videoWidth;
    canvas.height = videoRef!.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(videoRef!, 0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");

    setLoadingSend(true);
    await sendConfirmationMessage(parentData!.phone, message, data);
    setLoadingSend(false);

    setTimeout(() => {
      setResponse(null);
      setLoadingResponse(true);
      getReplies();
    }, 1000);
  };

  const getReplies = async () => {
    const res = await fetch(`/api/replies?phone=${parentData?.phone}`);
    const data = await res.json();

    const timeout = setTimeout(() => {
      getReplies();
    }, 1000);

    if (!data.fromMe) {
      clearTimeout(timeout);
      setLoadingResponse(false);
      setResponse(data);
    }
  };

  const onVideoReady = (ref: React.RefObject<HTMLVideoElement>) => {
    setVideoRef(ref.current);
  };

  if (loading) {
    return (
      <div className="w-screen flex items-center justify-center flex-col min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-screen flex items-center justify-center flex-col min-h-screen">
      {model && (
        <Detector
          labeledFaceDescriptors={model}
          onMatches={onMatches}
          onVideoReady={onVideoReady}
        />
      )}

      <div className="mt-4 text-center">
        <p>
          Orang Tua: {parentData?.name} ({parentData?.phone})
        </p>
        <p>Siswa: {studentData?.name}</p>
      </div>

      <div className="mt-4 mx-auto max-w-[720px] flex flex-col justify-center items-center">
        {value === "unknown" && (
          <div className="flex flex-col justify-center items-center w-full">
            <ChatBubble className="w-full" end>
              <ChatBubble.Message color="info">{message}</ChatBubble.Message>
            </ChatBubble>
            {response && (
              <ChatBubble className="w-full">
                <ChatBubble.Message color="warning">
                  {response.body}
                </ChatBubble.Message>
              </ChatBubble>
            )}
            <Button
              className="mt-2"
              color="ghost"
              loading={loadingResponse || loadingSend}
              onClick={handleSend}
              disabled={loadingResponse}
            >
              {loadingSend
                ? "Mengirim..."
                : loadingResponse
                ? "Menunggu Balasan..."
                : "Kirim"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
