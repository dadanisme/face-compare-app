import { Parent, Student } from "@/types/models";
import { db } from "./firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import * as faceapi from "face-api.js";

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          name: doc.data().name,
          parentId: doc.data().parentId,
          class: doc.data().class,
        } as Student;
      });
      setStudents(data);
    });

    return () => unsubscribe();
  }, []);

  return students;
};

export const useParents = () => {
  const [parents, setParents] = useState<Parent[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "parents"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          name: doc.data().name,
          studentId: doc.data().studentId,
          images: doc.data().images,
          phone: doc.data().phone,
        } as Parent;
      });
      setParents(data);
    });

    return () => unsubscribe();
  }, []);

  return parents;
};

export async function getModel(parentId: string) {
  const docRef = doc(db, "parents", parentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const parent = docSnap.data() as Parent;

  const descriptors = await Promise.all(
    parent.images.map(async (image) => {
      const img = await faceapi.fetchImage(image);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detections!.descriptor;
    })
  );

  return [new faceapi.LabeledFaceDescriptors(parent.name, descriptors)];
}

export const sendConfirmationMessage = async (
  phone: string,
  message: string,
  image: string
) => {
  const res = await fetch("/api/message/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: phone,
      message: message,
      image: image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
    }),
  });

  const data = await res.json();

  return data;
};
