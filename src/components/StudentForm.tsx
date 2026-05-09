import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compressImage } from "@/lib/image";
import type { Student } from "@/lib/db";

export function StudentForm({
  initial,
  batchId,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Student>;
  batchId: number;
  onSubmit: (s: Omit<Student, "id" | "createdAt">) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState<string>(initial?.age?.toString() ?? "");
  const [gender, setGender] = useState<Student["gender"]>(initial?.gender);
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [parentName, setParentName] = useState(initial?.parentName ?? "");
  const [parentPhone, setParentPhone] = useState(initial?.parentPhone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [joinDate, setJoinDate] = useState(initial?.joinDate ?? new Date().toISOString().slice(0, 10));
  const [beltLevel, setBelt] = useState(initial?.beltLevel ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photo, setPhoto] = useState<Blob | undefined>(initial?.photo);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhoto(await compressImage(f, 600));
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onSubmit({
          batchId,
          name: name.trim(),
          age: age ? Number(age) : undefined,
          gender,
          phone,
          parentName,
          parentPhone,
          address,
          joinDate,
          beltLevel,
          notes,
          photo,
        });
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="sname">Name *</Label>
          <Input id="sname" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="sage">Age</Label>
          <Input id="sage" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div>
          <Label>Gender</Label>
          <Select value={gender ?? ""} onValueChange={(v) => setGender(v as Student["gender"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sphone">Phone</Label>
          <Input id="sphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sjoin">Join date</Label>
          <Input id="sjoin" type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="spname">Parent name</Label>
          <Input id="spname" value={parentName} onChange={(e) => setParentName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="spphone">Parent phone</Label>
          <Input id="spphone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="sbelt">Belt / level</Label>
          <Input id="sbelt" value={beltLevel} onChange={(e) => setBelt(e.target.value)} placeholder="White, Yellow, ..." />
        </div>
        <div className="col-span-2">
          <Label htmlFor="saddr">Address</Label>
          <Textarea id="saddr" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="snotes">Notes</Label>
          <Textarea id="snotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="sphoto">Photo</Label>
          <Input id="sphoto" type="file" accept="image/*" onChange={onFile} />
          {photo && (
            <p className="text-xs text-muted-foreground mt-1">Photo selected ({Math.round(photo.size / 1024)} KB)</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
