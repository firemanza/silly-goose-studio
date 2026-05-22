import Button from "@/components/ui/button";
import type { Service } from "@/data/services";
import { getImagePath } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  reversed?: boolean;
}

export default function ServiceCard({ service, reversed }: ServiceCardProps) {
  return (
    <div className={`grid gap-8 rounded-sm border border-foreground/12 bg-surface/60 p-5 md:grid-cols-2 md:items-center md:p-7`}>
      <div className={`${reversed ? "md:order-2" : ""}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-foreground/12">
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getImagePath(service.image)})`,
              backgroundColor: "#d8cdb7",
            }}
          />
        </div>
      </div>

      <div className={`${reversed ? "md:order-1" : ""}`}>
        <h3 className="font-heading text-3xl text-foreground md:text-4xl">{service.title}</h3>
        <div className="mt-4 h-[2px] w-14 bg-accent" />
        <p className="mt-4 leading-relaxed text-muted">{service.description}</p>

        <ul className="mt-6 space-y-2.5">
          {service.deliverables.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-foreground/82">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button href="/contact" variant="secondary">
            Enquire About {service.title}
          </Button>
        </div>
      </div>
    </div>
  );
}
