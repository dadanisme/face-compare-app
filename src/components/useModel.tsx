"use client";
import { getModel } from "@/services";
import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export default function useModel(id: string) {
  const [model, setModel] = useState<faceapi.LabeledFaceDescriptors[]>();
  const [loading, setLoading] = useState(true);
  const [loadingModel, setLoadingModel] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    ]).then(() => setLoading(false));

    if (loading) return;
    setLoadingModel(true);
    getModel(id).then((model) => {
      if (model) {
        setModel(model);
        setLoadingModel(false);
      } else setError(true);
    });
  }, [loading, id]);

  return { model, loading: loadingModel, error };
}
