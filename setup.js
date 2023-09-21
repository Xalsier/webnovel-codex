// setup.js

import { fetchData } from './codex.js';
import { Handlers } from './handlers.js';
import { RefreshContent } from './refreshContent.js';

export class Setup {
    constructor() {
        this.data = null;
        this.init();
    }
    
    async init() {
        this.data = await fetchData();
        const handlers = new Handlers(this.data);
        const refresher = new RefreshContent(this.data);
        handlers.setupHandlers();
        refresher.refresh();
    }
}
