"use client";
import { getModel } from "@/services";
import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export default function useModel(id: string) {
  const [model, setModel] = useState<faceapi.LabeledFaceDescriptors[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    ]).then(() => setLoading(false));

    getModel(id).then((model) => {
      if (model) setModel(model);
      else setError(true);
    });
  }, []);

  return { model, loading, error };
}
