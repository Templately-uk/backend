import { Router } from 'express';
import TemplatesController from '../controllers/templates.controller';
import CommentsController from '../controllers/comments.controller';
import TagsController from '../controllers/tags.controller';
import EditorController from '../controllers/publish.controller';
import SearchController from '../controllers/search.controller';

export default Router()
  .use(TemplatesController)
  .use(CommentsController)
  .use(TagsController)
  .use(EditorController)
  .use(SearchController);
