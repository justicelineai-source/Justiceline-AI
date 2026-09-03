import { useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export type JudgmentPreviewRecord = {
  id?: string | number;
  Keycode?: number | null;
  COURT?: string | null;
  Judges?: string | null;
  Bench?: string | number | null;
  CaseNo?: string | null;
  Appellant?: string | null;
  Respondent?: string | null;
  Headnote?: string | null;
  HNote?: string | null;
  Judgement?: string | null;
  Actreferred?: string | null;
  Date?: string | null;
  Result?: string | null;
  Advocates?: string | null;
  year?: number | null;
};

type JudgmentPreviewDialogProps = {
  judgment: JudgmentPreviewRecord | null;
  onClose: () => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function JudgmentPreviewDialog({
  judgment,
  onClose,
}: JudgmentPreviewDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const judgmentDocumentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog
      open={Boolean(judgment)}
      onOpenChange={(open) => {
        if (!open) {
          setIsFullscreen(false);
          onClose();
        }
      }}
    >
      <DialogContent
        className={
          isFullscreen
            ? "h-screen w-screen max-w-none overflow-y-auto rounded-none bg-white p-0"
            : "max-h-[95vh] max-w-6xl overflow-y-auto bg-white p-0"
        }
      >
        {judgment && (
          <div
            ref={judgmentDocumentRef}
            className="pdf-document min-h-full bg-white text-[#351515]"
          >
            {/* TOP TOOLBAR */}
            <div className="pdf-toolbar sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#E4DCD2] bg-white px-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#351515]">
                Judgement Details
              </h2>

              <div className="flex items-center gap-2">
                {/* Fullscreen */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setIsFullscreen((current) => !current)
                  }
                  className={`rounded-full h-9 px-4 hover:bg-[#F5EEDC] ${
                    isFullscreen
                      ? "text-black hover:text-black"
                      : "text-[#806B5F] hover:text-[#351515]"
                  }`}
                  title={
                    isFullscreen
                      ? "Exit Fullscreen"
                      : "Open"
                  }
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      Minimize
                    </>
                  ) : (
                    <>
                      <Maximize2 className="mr-2 h-4 w-4" />
                      Open
                    </>
                  )}
                </Button>

                {/* Close */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsFullscreen(false);
                    onClose();
                  }}
                  className="
                    h-9 w-9
                    text-[#806B5F]
                    hover:bg-[#F5EEDC]
                    hover:text-[#351515]
                  "
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* DOCUMENT */}
            <main className="pdf-main mx-auto max-w-5xl px-8 py-10 sm:px-14">

              {/* CITATION */}
              <section className="text-center">
                {judgment.Keycode && (
                  <h1 className="text-xl font-bold text-[#351515]">
                    {judgment.Date
                      ? new Date(judgment.Date).getFullYear()
                      : judgment.year ?? ""}
                    {" "}JusticeLine {judgment.Keycode}
                  </h1>
                )}

                {/* COURT */}
                <h2 className="mt-3 text-xl font-bold uppercase text-[#351515]">
                  {judgment.COURT ?? "COURT"}
                </h2>

                {/* APPELLANT */}
                <p className="mt-4 text-lg font-bold leading-7 text-[#351515]">
                  {judgment.Appellant ?? "Appellant"}
                  <span className="font-normal text-[#806B5F]">
                    {" "}– Appellants
                  </span>
                </p>

                {/* VERSUS */}
                <p className="my-2 text-lg font-bold text-[#351515]">
                  Versus
                </p>

                {/* RESPONDENT */}
                <p className="text-lg font-bold leading-7 text-[#351515]">
                  {judgment.Respondent ?? "Respondent"}
                  <span className="font-normal text-[#806B5F]">
                    {" "}– Respondents
                  </span>
                </p>

                {/* CASE NUMBER */}
                <p className="mt-4 text-base text-[#806B5F]">
                  {judgment.CaseNo ?? "Case number unavailable"}
                </p>

                {/* DATE */}
                <p className="mt-2 text-base text-[#806B5F]">
                  <span className="font-medium text-[#351515]">
                    Decided On :
                  </span>{" "}
                  {formatDate(judgment.Date)}
                </p>
              </section>

              {/* ACTS REFERRED */}
              <section className="mt-8">
                <h3 className="mb-4 text-base font-bold text-[#351515]">
                  Act Referred :
                </h3>

                <div className="space-y-3">
                  {judgment.Actreferred ? (
                    judgment.Actreferred
                      .split(/\r?\n/)
                      .filter(Boolean)
                      .map((act, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 py-2"
                        >
                          <span className="shrink-0 text-base font-semibold text-black">
                            {index + 1}.
                          </span>

                          <span className="flex-1 text-[15px] leading-7 text-gray-900">
                            {act.replace(
                              /^\s*\d+[\.\)]\s*/,
                              ""
                            )}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-[#806B5F]">
                      No acts referred.
                    </p>
                  )}
                </div>
              </section>

              {/* JUDGES */}
              <section className="mt-8">
                <h3 className="mb-4 text-base font-bold text-[#351515]">
                  Judges :
                </h3>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {judgment.Judges ? (
                    judgment.Judges
                      .split(/[,;\n]+/)
                      .filter(Boolean)
                      .map((judge, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 py-2"
                        >
                          <span className="shrink-0 text-base font-semibold text-black">
                            {index + 1}.
                          </span>

                          <span className="text-[15px] leading-7 text-gray-900">
                            {judge.trim()}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-[#806B5F]">
                      No judges available.
                    </p>
                  )}
                </div>
              </section>

              {/* ADVOCATES */}
              {judgment.Advocates && (
                <section className="mt-8">
                  <h3 className="mb-4 text-base font-bold text-[#351515]">
                    Advocates :
                  </h3>

                  <div
                    className="text-base leading-8 text-[#351515]"
                    dangerouslySetInnerHTML={{
                      __html: judgment.Advocates,
                    }}
                  />
                </section>
              )}

              {/* HEADNOTE */}
              {(judgment.Headnote || judgment.HNote) && (
                <section className="mt-10 border-t border-[#E4DCD2] pt-8">
                  <h3 className="mb-4 text-lg font-bold text-[#351515]">
                    Headnote
                  </h3>

                  <div
                    className="text-base leading-8 text-[#351515]"
                    dangerouslySetInnerHTML={{
                      __html:
                        judgment.Headnote ||
                        judgment.HNote ||
                        "",
                    }}
                  />
                </section>
              )}

              {/* FULL JUDGMENT */}
              <section className="mt-5 border-t border-[#E4DCD2] pt-5">
                <h3 className="mb-6 text-lg font-bold text-[#351515]">
                  Judgment
                </h3>

                <div
                  className="
                    judgment-content
                    text-justify
                    text-base
                    leading-8
                    text-[#351515]
                  "
                  dangerouslySetInnerHTML={{
                    __html:
                      judgment.Judgement ||
                      "<p>Judgment text is not available.</p>",
                  }}
                />
              </section>

              {/* RESULT */}
              {judgment.Result && (
                <section className="mt-10 border-t border-[#E4DCD2] pt-8">
                  <h3 className="mb-4 text-lg font-bold text-[#351515]">
                    Result
                  </h3>

                  <p className="text-base leading-8 text-[#351515]">
                    {judgment.Result}
                  </p>
                </section>
              )}
            </main>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}