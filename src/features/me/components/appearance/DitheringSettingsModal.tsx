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
import { useI18n } from "@/i18n/useI18n";

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
  const { t } = useI18n();
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
    "rounded-lg border border-surface-card-border-default/70 bg-surface-chrome-background-default/40 p-3";

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
        className="block text-sm font-semibold font-sans text-foreground-primary-default"
      >
        {label}
      </label>
      <p className="mt-1 text-xs font-sans text-foreground-secondary-default">{description}</p>
      <div className="mt-3 flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleNumberChange(e.target.value, min, max, setter)}
          className="w-full accent-accent-fuchsia-border-default"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleNumberChange(e.target.value, min, max, setter)}
          className="w-24 rounded-md border border-surface-card-border-default/70 bg-surface-card-background-default px-2 py-1 text-sm font-sans text-foreground-primary-default"
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
        className="block text-sm font-semibold font-sans text-foreground-primary-default"
      >
        {label}
      </label>
      <p className="mt-1 text-xs font-sans text-foreground-secondary-default">{description}</p>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => setter(e.target.value as T)}
        className="mt-3 w-full rounded-md border border-surface-card-border-default/70 bg-surface-card-background-default px-3 py-2 text-sm font-sans text-foreground-primary-default disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {disabledHint ? (
        <p className="mt-2 text-xs font-sans text-foreground-secondary-default">
          {disabledHint}
        </p>
      ) : null}
    </div>
  );

  const footer = (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        text={t("common.close")}
        variant="secondary"
        size="md"
        onClick={onClose}
      />
      <Button
        text={t("settings.dithering.reset")}
        onClick={resetDitheringSettings}
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("settings.dithering.modalTitle")}
      footer={footer}
      className="max-w-5xl"
    >
      <div className="grid max-h-[75vh] grid-cols-1 gap-4 overflow-y-auto p-4 font-sans md:grid-cols-2 md:p-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-sans text-foreground-secondary-default">
            {t("settings.dithering.instantSave")}
          </p>

          <div className={controlBlockClass}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4
                  id="dithering-enabled-label"
                  className="text-sm font-semibold font-sans text-foreground-primary-default"
                >
                  {t("settings.dithering.enable")}
                </h4>
                <p className="text-xs font-sans text-foreground-secondary-default">
                  {t("settings.dithering.disableCopy")}
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
            label: t("settings.dithering.paletteSize"),
            description: t("settings.dithering.paletteSizeDescription"),
            value: settings.paletteSize,
            min: 2,
            max: 256,
            setter: setDitheringPaletteSize,
          })}

          {renderNumericControl({
            id: "processing-width",
            label: t("settings.dithering.processingWidth"),
            description: t("settings.dithering.processingWidthDescription"),
            value: settings.processingWidth,
            min: 64,
            max: 2048,
            setter: setDitheringProcessingWidth,
          })}

          {renderNumericControl({
            id: "dither-base-width",
            label: t("settings.dithering.baseWidth"),
            description: t("settings.dithering.baseWidthDescription"),
            value: settings.ditherBaseWidth,
            min: 16,
            max: 1024,
            setter: setDitheringBaseWidth,
          })}

          {renderSelectControl({
            id: "palette-quantization",
            label: "Palette quantization",
            description: t("settings.dithering.paletteQuantizationDescription"),
            value: settings.paletteQuantization,
            options: PALETTE_QUANTIZATION_OPTIONS,
            setter: (next) =>
              setDitheringPaletteQuantization(next as PaletteQuantization),
          })}

          {renderSelectControl({
            id: "color-distance",
            label: "Color distance formula",
            description: t("settings.dithering.colorDistanceDescription"),
            value: settings.colorDistanceFormula,
            options: COLOR_DISTANCE_FORMULA_OPTIONS,
            setter: (next) =>
              setDitheringColorDistanceFormula(next as ColorDistanceFormula),
          })}

          {renderSelectControl({
            id: "image-quantization",
            label: "Image quantization",
            description: t("settings.dithering.imageQuantizationDescription"),
            value: settings.imageQuantization,
            options: IMAGE_QUANTIZATION_OPTIONS,
            setter: (next) =>
              setDitheringImageQuantization(next as ImageQuantizationMode),
          })}

          {renderSelectControl({
            id: "error-diffusion-propagation",
            label: "Error diffusion propagation",
            description: t("settings.dithering.errorDiffusionDescription"),
            value: settings.errorDiffusionPropagation,
            options: ERROR_DIFFUSION_PROPAGATION_OPTIONS,
            setter: (next) =>
              setDitheringErrorDiffusionPropagation(
                next as ErrorDiffusionPropagationMode,
              ),
            disabled: !propagationApplicable,
            disabledHint: !propagationApplicable
              ? t("settings.dithering.disabledHint")
              : undefined,
          })}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold font-sans text-foreground-primary-default">
            Live preview
          </h4>

          {!previewAssetAvailable ? (
            <div className="rounded-lg border border-dashed border-surface-card-border-default/70 bg-surface-chrome-background-default/40 p-4 text-sm font-sans text-foreground-secondary-default">
              {t("settings.dithering.previewMissing")}
              <span className="mt-1 block font-mono text-foreground-primary-default">
                public/images/settings/dithering-preview.png
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-surface-card-border-default/70 bg-surface-chrome-background-default/40 p-2">
                <p className="mb-2 text-xs font-semibold font-sans text-foreground-secondary-default">
                  {t("settings.dithering.original")}
                </p>
                <img
                  src={PREVIEW_IMAGE_PATH}
                  alt={t("settings.dithering.originalAlt")}
                  className="h-auto w-full rounded-md"
                />
              </div>
              <div className="rounded-lg border border-surface-card-border-default/70 bg-surface-chrome-background-default/40 p-2">
                <p className="mb-2 text-xs font-semibold font-sans text-foreground-secondary-default">
                  {t("settings.dithering.after")}
                </p>
                <DitheredImage
                  src={PREVIEW_IMAGE_PATH}
                  alt={t("settings.dithering.afterAlt")}
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
            <p className="text-xs font-sans text-foreground-secondary-default">
              {t("settings.dithering.processing")}
            </p>
          ) : null}
          {previewProcessingError && previewAssetAvailable ? (
            <p className="text-xs font-sans text-red-400">
              {t("settings.dithering.processingError")}
            </p>
          ) : null}

          <div className="rounded-lg border border-surface-card-border-default/70 bg-surface-chrome-background-default/40 p-3 text-xs font-sans text-foreground-secondary-default">
            <p className="font-sans">
              {t("settings.dithering.preset", {
                enabled: settings.enabled
                  ? t("settings.dithering.enabled")
                  : t("settings.dithering.disabled"),
                palette: settings.paletteSize,
                processing: settings.processingWidth,
                base: settings.ditherBaseWidth,
              })}
            </p>
            <p className="mt-1 font-sans">
              {t("settings.dithering.defaults", {
                palette: DEFAULT_POST_DITHERING_SETTINGS.paletteQuantization,
                image: DEFAULT_POST_DITHERING_SETTINGS.imageQuantization,
              })}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
