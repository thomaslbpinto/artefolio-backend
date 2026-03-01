import { Injectable } from '@nestjs/common';
import ejs from 'ejs';
import path from 'path';

@Injectable()
export class TemplateService {
  private templatesDir = path.join(__dirname, 'templates');

  async render(template: string, data: ejs.Data): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${template}.ejs`);

    return await ejs.renderFile(templatePath, data);
  }
}
