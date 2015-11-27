angular.module('app-states', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state( 'dashboard', {
        	abstract: true,
            url: '/dashboard',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                    templateUrl: 'dashboard.tpl.html'
                }
            }
        })
        
        .state( 'login', {
            url: '/login',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                	controller: 'LoginCtrl',
                    templateUrl: 'auth/login.tpl.html'
                }
            },
            data:{ pageTitle: 'title.login' }
        })

        .state( 'loginuser', {
            url: '/login/:user',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                    controller: 'LoginUserCtrl',
                    templateUrl: 'auth/login.tpl.html'
                }
            },
            data:{ pageTitle: 'title.login' }
        })
        
        .state( 'dashboard.inbox', {
            url: '/inbox?:taskId',
            views: {
                "dashboardContent" : {
                    controller: 'InboxCtrl',
                    templateUrl: 'inbox/inbox.tpl.html'
                }
            },
            data:{ pageTitle: 'title.dashboard.inbox' }
        })
        
        .state( 'dashboard.codebooks', {
            url: '/codebooks?path',
            views: {
                "dashboardContent" : {
                    controller: 'CodebooksCtrl',
                    templateUrl: 'codebook/codebook-list.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.codebooks',
            	roles : ['cms_dictionary_manager', 'cms_infobasect_manager', 'cms_codetable_manager', 'cms_kcpcodetable_mgr', 'cms_mepct_manager', 'cms_grgct_manager']
            	}
        })
        .state( 'dashboard.codebook', {
            url: '/codebook?name',
            views: {
                "dashboardContent" : {
                    controller: 'CodebookCtrl',
                    templateUrl: 'codebook/codebook.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.codebooks',
            	roles : ['cms_dictionary_manager', 'cms_infobasect_manager', 'cms_codetable_manager', 'cms_kcpcodetable_mgr', 'cms_mepct_manager', 'cms_grgct_manager']
            	}
        })
        .state( 'dashboard.codebookDetail', {
            url: '/codebookDetail?codetable:id',
            views: {
                "dashboardContent" : {
                    controller: 'CodebookFormCtrl',
                    templateUrl: 'codebook/codebook-form.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.codebooks',
            	roles : ['cms_dictionary_manager', 'cms_infobasect_manager', 'cms_codetable_manager', 'cms_kcpcodetable_mgr', 'cms_mepct_manager', 'cms_grgct_manager']
            	}
        })
        
        .state( 'dashboard.template-select', {
            url: '/documents/tempselect',
            views: {
                "dashboardContent": {
                    controller: 'TemplateSelectCtrl',
                    templateUrl: 'documents/template-select.tpl.html'
                }
            },
            data:{ pageTitle: 'title.templateselect' }
        })
        
        .state( 'dashboard.reports', {
            url: '/reports?:selected',
            views: {
                "dashboardContent": {
                    controller: 'ReportsCtrl',
                    templateUrl: 'reports/reports.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.reports',
            	roles : ['editor']
            	}
        })
        
        .state( 'dashboard.email', {
            url: '/email',
            views: {
                "dashboardContent": {
                    controller: 'EmailCtrl',
                    templateUrl: 'email/email.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.email',
            	roles : ['editor']
            	}
        })
        
        .state( 'dashboard.dictionary', {
            url: '/dictionary',
            views: {
                "dashboardContent": {
                    controller: 'DictionaryCtrl',
                    templateUrl: 'dictionary/dictionary.tpl.html'
                }
            },
            data:{ 
            	pageTitle: 'title.dashboard.dictionary',
            	roles: []        	
            }
        })
        
        .state( 'dashboard.tarifs', {
            url: '/tarifs',
            views: {
                "dashboardContent": {
                    controller: 'TarifsCtrl',
                    templateUrl: 'tarifs/tarifs.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.tarifs',
            	roles: ['cms_list_of_charges_manager']
            	}
        })
        .state( 'overview', {
            url: '/overview?codetable',
            views: {
                "content": {
                    controller: 'OverviewCtrl',
                    templateUrl: 'tarifs/tarifs-overview.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.tarifs',
            	roles: ['cms_list_of_charges_manager']
            	}
        })
        .state( 'dashboard.tarif', {
            url: '/tarif?name',
            views: {
                "dashboardContent" : {
                    controller: 'TarifsCtrl',
                    templateUrl: 'tarifs/tarifs.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.dashboard.tarifs',
            	roles: ['cms_list_of_charges_manager']
            	}
        })
        .state( 'dashboard.tarifDetail', {
            url: '/tarifDetail?codetable:id',
            views: {
                "dashboardContent" : {
                    controller: 'CodebookFormCtrl',
                    templateUrl: 'codebook/codebook-form.tpl.html'
                }
            },
            data: {
                pageTitle: 'title.dashboard.codebooks',
                roles : ['cms_dictionary_manager', 'cms_infobasect_manager', 'cms_codetable_manager', 'cms_kcpcodetable_mgr', 'cms_mepct_manager', 'cms_grgct_manager']
            }
        })
        .state( 'dashboard.webcabinets', {
            url: '/webcabinets?:path:id',
            views: {
                "dashboardContent": {
                    controller: 'WebCabinetsCtrl',
                    templateUrl: 'documents/documents-list.tpl.html'
                }
            },
            data:{ pageTitle: 'title.dashboard.webcabinets' }
        })
        
        .state( 'dashboard.my', {
            url: '/my',
            views: {
                "dashboardContent": {
                    controller: 'MyDocumentsCtrl',
                    templateUrl: 'documents/documents-list.tpl.html'
                }
            },
            data:{ pageTitle: 'title.dashboard.documents.my' }
        })
        
        .state( 'dashboard.fav', {
            url: '/favorite',
            views: {
                "dashboardContent": {
                    controller: 'FavDocumentsCtrl',
                    templateUrl: 'documents/documents-list.tpl.html'
                }
            },
            data:{ pageTitle: 'title.dashboard.documents.fav' }
        })
        
        .state( 'dashboard.search', {
            url: '/search/:searchString',
            views: {
                "dashboardContent": {
                    controller: 'SearchCtrl',
                    templateUrl: 'documents/documents-list.tpl.html'
                }
            },
            data:{ pageTitle: 'title.dashboard.search' }
        })
        
        .state( 'dashboard.advancedsearch', {
            url: '/advancedsearch?:selected',
            views: {
                "dashboardContent": {
                    controller: 'AdvancedSearchCtrl',
                    templateUrl: 'search/advanced-search.tpl.html'
                }
            },
            data:{ pageTitle: 'title.dashboard.advancedsearch' }
        })
        
        .state( 'document', {
            url: '/documents/document?portal:templateType:code:templateId:documentId:tab',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                    controller: "DocumentCtrl",
                    templateUrl: 'documents/document.tpl.html'
                }
            },
            data:{ pageTitle: 'title.document' }
            ,
            reloadOnSearch: false
        })
        .state( 'import', {
            url: '/import?portal',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                    controller: "ImportCtrl",
                    templateUrl: 'import/import.tpl.html'
                }
            },
            data:{ pageTitle: 'title.import' }
        })
        .state( 'tarifimport', {
            url: '/tarifs/import?portal',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                    controller: "TarifImportCtrl",
                    templateUrl: 'tarifs/tarifs-import.tpl.html'
                }
            },
            data: { 
            	pageTitle: 'title.tarifimport',
            	roles: ['cms_list_of_charges_manager']
            	}
        })
        .state( 'audit', {
            url: '/audit',
            views: {
                "menu" : {
                    templateUrl: 'templates/menu.tpl.html'
                },
                "content": {
                    controller: "AuditCtrl",
                    templateUrl: 'auth/audit.tpl.html'
                }
            },
            data:{ pageTitle: 'title.audit' }
        })
        .state( 'baseImage', {
            url: '/baseImage?type=images',
            views: {
                "content": {
                    controller: 'BaseSelectCtrl',
                    templateUrl: 'documents/base-select.tpl.html'
                }
            },
            data:{ pageTitle: 'title.imageSelect' }
        })
        .state( 'baseImageEditor', {
            url: '/baseImageEditor?type:rootfolder_api:files_api:search_api:params',
            views: {
                "content": {
                    controller: 'BaseSelectEditorCtrl',
                    templateUrl: 'documents/base-select.tpl.html'
                }
            },
            data:{ pageTitle: 'title.imageSelect' }
        }) 
        .state( 'baseUploadEditor', {
            url: '/baseUploadEditor?:id',
            views: {
                "content": {
                    controller: 'BaseUploadEditorCtrl',
                    templateUrl: 'documents/base-upload.tpl.html'
                }
            },
            data:{ pageTitle: 'title.imageSelect' }
        })
        .state( 'treeControlEditor', {
            url: '/treeControlEditor?:id',
            views: {
                "content": {
                    controller: 'TreeModalEditorCtrl',
                    templateUrl: 'documents/treeModalEditor.tpl.html'
                }
            },
            data:{ pageTitle: 'title.imageSelect' }
        })

        ;
    }]);