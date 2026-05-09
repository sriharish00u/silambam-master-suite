import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsRepo } from "@/lib/repos";
import { compressImage } from "@/lib/image";
import { useBlobURL } from "@/hooks/use-blob-url";

export function SettingsPage() {
  const settings = useLiveQuery(() => settingsRepo.get(), []);
  const [masterName, setMasterName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [signature, setSignature] = useState<Blob | undefined>();
  const sigUrl = useBlobURL(signature);

  useEffect(() => {
    if (settings) {
      setMasterName(settings.masterName ?? "");
      setSchoolName(settings.schoolName ?? "");
      setSignature(settings.signature);
    }
  }, [settings?.id]);

  return (
    <div>
      <PageHeader title="Settings" description="Master profile used in certificates" />
      <Card>
        <CardContent className="p-6 space-y-4 max-w-lg">
          <div>
            <Label htmlFor="mname">Master name</Label>
            <Input id="mname" value={masterName} onChange={(e) => setMasterName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sname">School / Academy name</Label>
            <Input id="sname" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sig">Signature image (transparent PNG works best)</Label>
            <Input
              id="sig"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setSignature(await compressImage(f, 400));
              }}
            />
            {sigUrl && (
              <img src={sigUrl} alt="signature" className="h-16 mt-2 bg-muted rounded p-1" />
            )}
          </div>
          <Button
            onClick={async () => {
              await settingsRepo.save({ masterName, schoolName, signature });
              toast.success("Saved");
            }}
          >
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
