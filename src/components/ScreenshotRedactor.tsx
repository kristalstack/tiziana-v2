
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  image: string;
  locale: "es" | "en";
  onConfirm: (image: string) => void;
  onCancel: () => void;
};

export default function ScreenshotRedactor({
  image,
  locale,
  onConfirm,
  onCancel,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [brushSize, setBrushSize] = useState(32);
  const [ready, setReady] = useState(false);

  const es = locale === "es";

  useEffect(() => {
    let active = true;
    const img = new window.Image();

    img.onload = () => {
      if (!active) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(img, 0, 0);
      setReady(true);
    };

    img.src = image;

    return () => {
      active = false;
    };
  }, [image]);

  function getPoint(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current!;

    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function coverPoint(x: number, y: number) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) return;

    context.fillStyle = "#17204A";
    context.beginPath();
    context.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (!ready) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    drawingRef.current = true;

    const point = getPoint(event);
    lastPointRef.current = point;
    coverPoint(point.x, point.y);
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (!drawingRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) return;

    const point = getPoint(event);
    const previous = lastPointRef.current ?? point;

    context.strokeStyle = "#17204A";
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    lastPointRef.current = point;
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function confirm() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    // Exportamos una imagen nueva con las áreas cubiertas.
    // La imagen original no se envía a la API.
    const editedImage = canvas.toDataURL("image/jpeg", 0.85);

if (editedImage.length > 6_000_000) {
  alert(
    es
      ? "La imagen editada es demasiado grande. Prueba con una captura más pequeña."
      : "The edited image is too large. Try a smaller screenshot."
  );
  return;
}

onConfirm(editedImage);
  }

  return (
    <div className="rounded-xl border border-[#DAD7EE] bg-[#F9F4F0] p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-[#17204A]">
        {es ? "Protege tu privacidad" : "Protect your privacy"}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#565D78]">
        {es
          ? "Pinta sobre nombres, fotos, teléfonos y otros datos personales. Las zonas cubiertas no serán visibles para Tiziana."
          : "Paint over names, photos, phone numbers, and other personal details. Covered areas will not be visible to Tiziana."}
      </p>

      <div className="mt-5 max-h-[450px] overflow-auto rounded-lg border border-[#DAD7EE] bg-white p-2">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="mx-auto block h-auto max-w-full cursor-crosshair touch-none"
          aria-label={
            es ? "Editor de privacidad" : "Privacy editor"
          }
        />
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-[#17204A]">
          {es ? "Tamaño del pincel" : "Brush size"}
        </label>

        <input
          type="range"
          min="10"
          max="150"
          value={brushSize}
          onChange={(event) =>
            setBrushSize(Number(event.target.value))
          }
          className="mt-3 w-full accent-[#334B92]"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#DAD7EE] px-5 py-3 text-sm font-medium text-[#17204A]"
        >
          {es ? "Cancelar" : "Cancel"}
        </button>

        <button
          type="button"
          onClick={confirm}
          disabled={!ready}
          className="rounded-lg bg-[#334B92] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {es ? "Usar esta captura" : "Use this screenshot"}
        </button>
      </div>
    </div>
  );
}
