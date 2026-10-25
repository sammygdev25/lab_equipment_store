import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface FooterLink { label: string; to: string }
export interface FooterColumn { title: string; links: FooterLink[] }
export interface FooterProps { brand: ReactNode; tagline?: ReactNode; columns?: FooterColumn[]; note?: ReactNode }

export function Footer({ brand, tagline, columns = [], note }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="ds-footer">
      <div className="ds-container">
        {columns.length > 0 ? (
          <div className="ds-footer-grid">
            <div>
              <div className="ds-nav-brand">{brand}</div>
              {tagline ? <p>{tagline}</p> : null}
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.to + l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        <div className="ds-footer-bottom">
          <span>&copy; {year} {brand}</span>
          {note ? <span>{note}</span> : null}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
