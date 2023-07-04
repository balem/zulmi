import React from 'react';

export const MtessUploadReceiptConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/mtess-upload-receipt/:id?',
            component: React.lazy(() => import('./MtessUploadReceipt'))
        }
    ]
};
