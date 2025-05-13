import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Undo2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onChange: (value: string) => void;
  value?: string;
}

const SignaturePad = ({ onChange, value }: SignaturePadProps) => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (value && sigCanvas.current) {
      sigCanvas.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value]);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      onChange("");
    }
  };

  const save = () => {
    if (sigCanvas.current && !isEmpty) {
      const signatureData = sigCanvas.current.toDataURL("image/png");
      onChange(signatureData);
    }
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() || true);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-md overflow-hidden signature-pad-container">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "signature-pad",
            width: 500,
            height: 200,
          }}
          backgroundColor="white"
          onEnd={handleEnd}
        />
      </div>
      <div className="flex space-x-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={isEmpty}
        >
          <Undo2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={save}
          disabled={isEmpty}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Signature
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Please sign above using your mouse or touch device
      </p>
    </div>
  );
};

export default SignaturePad;
