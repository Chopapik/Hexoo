"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import SwitchButton from "@/features/shared/components/ui/SwitchButton";
import { DitheredImage } from "@/features/shared/components/media/DitheredImage";
import {
  COLOR_DISTANCE_FORMULA_OPTIONS,
  DEFAULT_POST_DITHERING_SETTINGS,
  ERROR_DIFFUSION_PROPAGATION_OPTIONS,
  IMAGE_QUANTIZATION_OPTIONS,
  IMAGE_QUANTIZATION_WITH_PROPAGATION,
  PALETTE_QUANTIZATION_OPTIONS,
  type ColorDistanceFormula,
  type ErrorDiffusionPropagationMode,
  type ImageQuantizationMode,
  type PaletteQuantization,
  type PostDitheringSettings,
} from "@/features/shared/types/dithering";
import { useAppStore } from "@/lib/store/store";

type DitheringSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PREVIEW_IMAGE_PATH = "/images/settings/dithering-preview.png";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function DitheringSettingsModal({
  isOpen,
  onClose,
}: DitheringSettingsModalProps) {
  const settings = useAppStore((s) => s.settings.postDithering);
  const resetDitheringSettings = useAppStore((s) => s.resetDitheringSettings);
  const setDitheringEnabled = useAppStore((s) => s.setDitheringEnabled);
  const setDitheringPaletteSize = useAppStore((s) => s.setDitheringPaletteSize);
  const setDitheringProcessingWidth = useAppStore(
    (s) => s.setDitheringProcessingWidth,
  );
  const setDitheringBaseWidth = useAppStore((s) => s.setDitheringBaseWidth);
  const setDitheringColorDistanceFormula = useAppStore(
    (s) => s.setDitheringColorDistanceFormula,
  );
  const setDitheringPaletteQuantization = useAppStore(
    (s) => s.setDitheringPaletteQuantization,
  );
  const setDitheringImageQuantization = useAppStore(
    (s) => s.setDitheringImageQuantization,
  );
  const setDitheringErrorDiffusionPropagation = useAppStore(
    (s) => s.setDitheringErrorDiffusionPropagation,
  );

  const [debouncedPreviewSettings, setDebouncedPreviewSettings] =
    useState<PostDitheringSettings>(settings);
  const [isPreviewReady, setIsPreviewReady] = useState(true);
  const [previewProcessingError, setPreviewProcessingError] = useState(false);
  const [previewAssetAvailable, setPreviewAssetAvailable] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedPreviewSettings(settings);
    }, 160);
    return () => window.clearTimeout(timeout);
  }, [settings]);

  useEffect(() => {
    if (!isOpen) return;
    setIsPreviewReady(false);
    setPreviewProcessingError(false);
  }, [debouncedPreviewSettings, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const imageProbe = new window.Image();
    imageProbe.onload = () => setPreviewAssetAvailable(true);
    imageProbe.onerror = () => setPreviewAssetAvailable(false);
    imageProbe.src = PREVIEW_IMAGE_PATH;
  }, [isOpen]);

  const propagationApplicable = useMemo(
    () => IMAGE_QUANTIZATION_WITH_PROPAGATION.has(settings.imageQuantization),
    [settings.imageQuantization],
  );

  const handleNumberChange = (
    rawValue: string,
    min: number,
    max: number,
    setter: (value: number) => void,
  ) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) return;
    setter(clamp(Math.round(parsed), min, max));
  };

  const controlBlockClass =
    "rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-3";

  const renderNumericControl = ({
    id,
    label,
    description,
    value,
    min,
    max,
    setter,
  }: {
    id: string;
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    setter: (value: number) => void;
  }) => (
    <div className={controlBlockClass}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-text-main"
      >
        {label}
      </label>
      <p className="mt-1 text-xs text-text-neutral">{description}</p>
      <div className="mt-3 flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleNumberChange(e.target.value, min, max, setter)}
          className="w-full accent-primary-fuchsia-stroke-default"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleNumberChange(e.target.value, min, max, setter)}
          className="w-24 rounded-md border border-primary-neutral-stroke-default/70 bg-primary-neutral-background-default px-2 py-1 text-sm text-text-main"
        />
      </div>
    </div>
  );

  const renderSelectControl = <T extends string>({
    id,
    label,
    description,
    value,
    options,
    setter,
    disabled = false,
    disabledHint,
  }: {
    id: string;
    label: string;
    description: string;
    value: T;
    options: Array<{ value: T; label: string }>;
    setter: (value: T) => void;
    disabled?: boolean;
    disabledHint?: string;
  }) => (
    <div className={controlBlockClass}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-text-main"
      >
        {label}
      </label>
      <p className="mt-1 text-xs text-text-neutral">{description}</p>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => setter(e.target.value as T)}
        className="mt-3 w-full rounded-md border border-primary-neutral-stroke-default/70 bg-primary-neutral-background-default px-3 py-2 text-sm text-text-main disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {disabledHint ? (
        <p className="mt-2 text-xs text-text-neutral">{disabledHint}</p>
      ) : null}
    </div>
  );

  const footer = (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button text="Zamknij" variant="secondary" size="md" onClick={onClose} />
      <Button text="Przywróć domyślne" onClick={resetDitheringSettings} />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ustawienia ditheringu postów"
      footer={footer}
      className="max-w-5xl"
    >
      <div className="grid max-h-[75vh] grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 md:p-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-neutral">
            Zmiany działają od razu i zapisują się lokalnie.
          </p>

          <div className={controlBlockClass}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4
                  id="dithering-enabled-label"
                  className="text-sm font-semibold text-text-main"
                >
                  Włącz dithering
                </h4>
                <p className="text-xs text-text-neutral">
                  Wyłącz, aby używać oryginalnych obrazów bez przetwarzania.
                </p>
              </div>
              <SwitchButton
                checked={settings.enabled}
                onChange={setDitheringEnabled}
                labelledBy="dithering-enabled-label"
              />
            </div>
          </div>

          {renderNumericControl({
            id: "palette-size",
            label: "Liczba kolorów (palette size)",
            description: "Ile kolorów ma finalna paleta.",
            value: settings.paletteSize,
            min: 2,
            max: 256,
            setter: setDitheringPaletteSize,
          })}

          {renderNumericControl({
            id: "processing-width",
            label: "Szerokość przetwarzania (processing width)",
            description: "Rozdzielczość robocza przed końcowym skalowaniem.",
            value: settings.processingWidth,
            min: 64,
            max: 2048,
            setter: setDitheringProcessingWidth,
          })}

          {renderNumericControl({
            id: "dither-base-width",
            label: "Bazowa szerokość ditheru (dither base width)",
            description: "Szerokość mikrosiatki, która buduje pikselowy efekt.",
            value: settings.ditherBaseWidth,
            min: 16,
            max: 1024,
            setter: setDitheringBaseWidth,
          })}

          {renderSelectControl({
            id: "palette-quantization",
            label: "Palette quantization",
            description: "Algorytm budowania palety kolorów.",
            value: settings.paletteQuantization,
            options: PALETTE_QUANTIZATION_OPTIONS,
            setter: (next) =>
              setDitheringPaletteQuantization(next as PaletteQuantization),
          })}

          {renderSelectControl({
            id: "color-distance",
            label: "Color distance formula",
            description: "Metryka porównywania podobieństwa kolorów.",
            value: settings.colorDistanceFormula,
            options: COLOR_DISTANCE_FORMULA_OPTIONS,
            setter: (next) =>
              setDitheringColorDistanceFormula(next as ColorDistanceFormula),
          })}

          {renderSelectControl({
            id: "image-quantization",
            label: "Image quantization",
            description: "Sposób mapowania pikseli obrazu do palety.",
            value: settings.imageQuantization,
            options: IMAGE_QUANTIZATION_OPTIONS,
            setter: (next) =>
              setDitheringImageQuantization(next as ImageQuantizationMode),
          })}

          {renderSelectControl({
            id: "error-diffusion-propagation",
            label: "Error diffusion propagation",
            description: "Tryb propagacji błędu dla algorytmów diffusion.",
            value: settings.errorDiffusionPropagation,
            options: ERROR_DIFFUSION_PROPAGATION_OPTIONS,
            setter: (next) =>
              setDitheringErrorDiffusionPropagation(
                next as ErrorDiffusionPropagationMode,
              ),
            disabled: !propagationApplicable,
            disabledHint: !propagationApplicable
              ? "Dla wybranego trybu image quantization ta opcja nie wpływa na wynik."
              : undefined,
          })}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-text-main">Live preview</h4>

          {!previewAssetAvailable ? (
            <div className="rounded-lg border border-dashed border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-4 text-sm text-text-neutral">
              Dodaj plik preview tutaj:
              <span className="mt-1 block font-mono text-text-main">
                public/images/settings/dithering-preview.png
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-2">
                <p className="mb-2 text-xs font-semibold text-text-neutral">
                  Oryginał
                </p>
                <img
                  src={PREVIEW_IMAGE_PATH}
                  alt="Podgląd oryginalnego obrazu"
                  className="h-auto w-full rounded-md"
                />
              </div>
              <div className="rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-2">
                <p className="mb-2 text-xs font-semibold text-text-neutral">
                  Po ditheringu
                </p>
                <DitheredImage
                  src={PREVIEW_IMAGE_PATH}
                  alt="Podgląd obrazu po ditheringu"
                  className="h-auto w-full rounded-md"
                  width={1200}
                  height={800}
                  dithering={debouncedPreviewSettings}
                  onReadyChange={setIsPreviewReady}
                  onErrorChange={setPreviewProcessingError}
                />
              </div>
            </div>
          )}

          {!isPreviewReady && previewAssetAvailable ? (
            <p className="text-xs text-text-neutral">
              Przetwarzanie preview...
            </p>
          ) : null}
          {previewProcessingError && previewAssetAvailable ? (
            <p className="text-xs text-red-400">
              Przetwarzanie preview nie powiodło się. Pokazano obraz bez
              modyfikacji.
            </p>
          ) : null}

          <div className="rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-3 text-xs text-text-neutral">
            <p>
              Aktualny preset: {settings.enabled ? "włączony" : "wyłączony"},
              paleta {settings.paletteSize}, processing{" "}
              {settings.processingWidth}px, base {settings.ditherBaseWidth}px.
            </p>
            <p className="mt-1">
              Domyślne: {DEFAULT_POST_DITHERING_SETTINGS.paletteQuantization} /{" "}
              {DEFAULT_POST_DITHERING_SETTINGS.imageQuantization}.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
