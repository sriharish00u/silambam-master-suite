import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { historyRepo } from "@/lib/repos";

export function HistoryPage() {
  const items = useLiveQuery(() => historyRepo.list(), []) ?? [];
  return (
    <div>
      <PageHeader title="History" description="Restore deleted batches and students" />
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No deleted items.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {items.map((item) => {
            const data = item.data as { batch?: { name: string }; name?: string };
            const name =
              item.type === "batch"
                ? `Batch · ${data.batch?.name ?? ""}`
                : `Student · ${data.name ?? ""}`;
            return (
              <Card key={item.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground">
                      Deleted {format(item.deletedAt, "PPp")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      if (item.type === "batch") await historyRepo.restoreBatch(item.id!);
                      else await historyRepo.restoreStudent(item.id!);
                      toast.success("Restored");
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> Restore
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete forever?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await historyRepo.remove(item.id!);
                            toast.success("Deleted permanently");
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
