export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_REPO_NAME
    ? `/${process.env.NEXT_PUBLIC_REPO_NAME}`
    : "";
}

export function getImagePath(path: string): string {
  if (/^(https?:)?\/\//.test(path)) {
    return path;
  }

  return `${getBasePath()}${path}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
