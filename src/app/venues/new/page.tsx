import { PageHeader } from "@/components/page-header";
import { VenueForm } from "@/components/venue-form";

export default function NewVenuePage() {
  return (
    <>
      <PageHeader title="新增投稿对象" description="会议/论坛与期刊字段不同，按实际类型填写对应区域即可。" backHref="/venues" />
      <VenueForm />
    </>
  );
}
