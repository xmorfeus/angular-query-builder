var configuration = {
		//'backend': 'http://www.csint.cz/newwcm/rest/',
		//'backend': 'http://tinetas1.vs.csin.cz:5011/newwcmDEV/rest/',
		'backend': 'http://dwcm.csint.cz/wcm/rest/',
		//'backend': 'http://tinetas1.vs.csin.cz:5011/newwcm/rest/',
        //'docsUrl': 'http://wcmedu.csint.cz/webview/ewcm',
		'docsUrl': 'http://dwcm.csint.cz/wcm/',
        //"defUser" : "cms_test6",
        "defUser" : "cen78221",
		"version" : "2.1.9",


	// Editor options.
	"advanced" : {
		language: 'cs',
		allowedContent: true,
		entities: false,
		htmlEncodeOutput: false,
		skin: 'flat',
		disableNativeSpellChecker: false,
		forcePasteAsPlainText: true,

		extraPlugins : 'justify,iframedialog,baseImage,baseUpload,baseUrl,dragresize,sourcedialog,tableresize,sourcedialog,codemirror,stylesheetparser-fixed,quicktable,strinsert,yellowing,treeTermGeneral,doksoft_table_new,doksoft_table_add_row_up,doksoft_table_add_row_down,doksoft_table_add_col_left,doksoft_table_add_col_right,doksoft_table_add_cell_left,doksoft_table_add_cell_right,doksoft_table_row_move_down,doksoft_table_row_move_up,doksoft_table_col_move_left,doksoft_table_col_move_right,doksoft_table_delete_col,doksoft_table_delete_row,doksoft_table_delete_cell,doksoft_table_merge_cells,doksoft_table_merge_cell_right,doksoft_table_merge_cell_down,doksoft_table_split_cell_hor,doksoft_table_split_cell_vert',
		contentsCss : 'wcmstyleIA.css',
		stylesSet : [],
		doksoft_table_new_class: 'redheading blackheading noborder alternate_highlite',
		height: '500px',
		toolbar: [
			{ name: 'clipboard',  items: [ 'Cut', 'Copy', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
			{name: 'remove', items: ['RemoveFormat', 'Find']},
			{ name: 'editing', items: [ 'HorizontalRule' ] },
			{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor', 'BaseUrl', 'BaseImage', 'BaseUpload', 'TreeTermGeneral'] },
			{ name: 'insert', items: [ 'strinsert' ] },
			{ name: 'styles', items: [ 'Styles', 'Format', 'yellowing'] },
			'/',
			{ name: 'tables', items: [ 'doksoft_table_new' ] },
			{ name: 'instables', items: [ 'doksoft_table_add_row_up', 'doksoft_table_add_row_down', 'doksoft_table_add_col_left', 'doksoft_table_add_col_right' ] },
			{ name: 'inscells', items: [ 'doksoft_table_add_cell_left', 'doksoft_table_add_cell_right'] },
			{ name: 'movetables', items: [ 'doksoft_table_row_move_up', 'doksoft_table_row_move_down', 'doksoft_table_col_move_left', 'doksoft_table_col_move_right' ] },
			{ name: 'deltables', items: [ 'doksoft_table_delete_col', 'doksoft_table_delete_row', 'doksoft_table_delete_cell' ] },
			{ name: 'mergetables', items: [ 'doksoft_table_merge_cells', 'doksoft_table_merge_cell_right', 'doksoft_table_merge_cell_down' ] },
			{ name: 'splittables', items: [ 'doksoft_table_split_cell_hor', 'doksoft_table_split_cell_vert'] },
			'/',
			{ name: 'basicstyles', items: [ 'Bold', 'Italic' ] },
			{ name: 'justify', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]},
			{ name: 'lists', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent' ]},
			{ name: 'scritps', items: [ 'Subscript', 'Superscript']},
			{ name: 'document', items: [ 'Sourcedialog']}
		],
		qtRows: 4, // Count of rows
		qtColumns: 5, // Count of columns
		qtBorder: '0', // Border of inserted table
		qtWidth: '100%', // Width of inserted table
		//qtStyle: { 'border-collapse' : 'collapse' },
		qtClass: 'border', // Class of table
		qtCellPadding: '0', // Cell padding table
		qtCellSpacing: '0', // Cell spacing table
		//qtPreviewBorder: '4px double black', // preview table border
		//qtPreviewSize: '4px', // Preview table cell size
		//qtPreviewBackground: '#c8def4' // preview table background (hover)
	},

	"advanced_IE" : {
		language: 'cs',
		allowedContent: true,
		entities: false,
		htmlEncodeOutput: false,
		skin: 'flat',
		disableNativeSpellChecker: false,
		forcePasteAsPlainText: true,

		extraPlugins : 'justify,iframedialog,baseImage,baseUpload,baseUrl,dragresize,sourcedialog,tableresize,sourcedialog,codemirror,stylesheetparser-fixed,quicktable,strinsert,yellowing,treeTermGeneral,doksoft_table_new,doksoft_table_add_row_up,doksoft_table_add_row_down,doksoft_table_add_col_left,doksoft_table_add_col_right,doksoft_table_add_cell_left,doksoft_table_add_cell_right,doksoft_table_row_move_down,doksoft_table_row_move_up,doksoft_table_col_move_left,doksoft_table_col_move_right,doksoft_table_delete_col,doksoft_table_delete_row,doksoft_table_delete_cell,doksoft_table_merge_cells,doksoft_table_merge_cell_right,doksoft_table_merge_cell_down,doksoft_table_split_cell_hor,doksoft_table_split_cell_vert',
		contentsCss : 'wcmstyleIE.css',
		stylesSet : [],
		height: '500px',
		toolbar: [
			{ name: 'clipboard',  items: [ 'Cut', 'Copy', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
			{name: 'remove', items: ['RemoveFormat', 'Find']},
			{ name: 'editing', items: [ 'HorizontalRule' ] },
			{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor', 'BaseUrl', 'BaseImage', 'BaseUpload', 'TreeTermGeneral'] },
			{ name: 'insert', items: [ 'strinsert' ] },
			{ name: 'styles', items: [ 'Styles', 'Format', 'yellowing'] },
			'/',
			{ name: 'tables', items: [ 'doksoft_table_new' ] },
			{ name: 'instables', items: [ 'doksoft_table_add_row_up', 'doksoft_table_add_row_down', 'doksoft_table_add_col_left', 'doksoft_table_add_col_right' ] },
			{ name: 'inscells', items: [ 'doksoft_table_add_cell_left', 'doksoft_table_add_cell_right'] },
			{ name: 'movetables', items: [ 'doksoft_table_row_move_up', 'doksoft_table_row_move_down', 'doksoft_table_col_move_left', 'doksoft_table_col_move_right' ] },
			{ name: 'deltables', items: [ 'doksoft_table_delete_col', 'doksoft_table_delete_row', 'doksoft_table_delete_cell' ] },
			{ name: 'mergetables', items: [ 'doksoft_table_merge_cells', 'doksoft_table_merge_cell_right', 'doksoft_table_merge_cell_down' ] },
			{ name: 'splittables', items: [ 'doksoft_table_split_cell_hor', 'doksoft_table_split_cell_vert'] },
			'/',
			{ name: 'basicstyles', items: [ 'Bold', 'Italic' ] },
			{ name: 'justify', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]},
			{ name: 'lists', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent' ]},
			{ name: 'scritps', items: [ 'Subscript', 'Superscript']},
			{ name: 'document', items: [ 'Sourcedialog']}
		],
		qtRows: 4, // Count of rows
		qtColumns: 5, // Count of columns
		qtBorder: '0', // Border of inserted table
		qtWidth: '100%', // Width of inserted table
		//qtStyle: { 'border-collapse' : 'collapse' },
		qtClass: 'border', // Class of table
		qtCellPadding: '0', // Cell padding table
		qtCellSpacing: '0', // Cell spacing table
		//qtPreviewBorder: '4px double black', // preview table border
		//qtPreviewSize: '4px', // Preview table cell size
		//qtPreviewBackground: '#c8def4' // preview table background (hover)
	},

	"simple" : {
		language: 'cs',
		allowedContent: true,
		entities: false,
		htmlEncodeOutput: false,
		skin: 'flat',
		basicEntities: false,
		extraPlugins : 'baseUrl',
		toolbar: [
			{ name: 'clipboard',  items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },

			{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor', 'BaseUrl' ] },

			{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },

		]

	},

	"kcp" : {
		language: 'cs',
		allowedContent: true,
		entities: false,
		htmlEncodeOutput: false,
		skin: 'flat',
		disableNativeSpellChecker: false,
		forcePasteAsPlainText: true,

		extraPlugins : 'justify,iframedialog,baseImage,baseUpload,baseUrl,dragresize,sourcedialog,tableresize,sourcedialog,codemirror,stylesheetparser-fixed,quicktable,strinsert,yellowing,,doksoft_table_new,doksoft_table_add_row_up,doksoft_table_add_row_down,doksoft_table_add_col_left,doksoft_table_add_col_right,doksoft_table_add_cell_left,doksoft_table_add_cell_right,doksoft_table_row_move_down,doksoft_table_row_move_up,doksoft_table_col_move_left,doksoft_table_col_move_right,doksoft_table_delete_col,doksoft_table_delete_row,doksoft_table_delete_cell,doksoft_table_merge_cells,doksoft_table_merge_cell_right,doksoft_table_merge_cell_down,doksoft_table_split_cell_hor,doksoft_table_split_cell_vert',
		contentsCss : 'wcmstyleIA.css',
		stylesSet : [],
		height: '500px',
		toolbar: [
			{ name: 'clipboard',  items: [ 'Cut', 'Copy', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
			{name: 'remove', items: ['RemoveFormat', 'Find']},
			{ name: 'editing', items: [ 'HorizontalRule' ] },
			{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor', 'BaseUrl', 'BaseImage', 'BaseUpload'] },
			{ name: 'insert', items: [ 'strinsert' ] },
			{ name: 'styles', items: [ 'Styles', 'Format', 'yellowing'] },
			'/',
			{ name: 'tables', items: [ 'doksoft_table_new' ] },
			{ name: 'instables', items: [ 'doksoft_table_add_row_up', 'doksoft_table_add_row_down', 'doksoft_table_add_col_left', 'doksoft_table_add_col_right' ] },
			{ name: 'inscells', items: [ 'doksoft_table_add_cell_left', 'doksoft_table_add_cell_right'] },
			{ name: 'movetables', items: [ 'doksoft_table_row_move_up', 'doksoft_table_row_move_down', 'doksoft_table_col_move_left', 'doksoft_table_col_move_right' ] },
			{ name: 'deltables', items: [ 'doksoft_table_delete_col', 'doksoft_table_delete_row', 'doksoft_table_delete_cell' ] },
			{ name: 'mergetables', items: [ 'doksoft_table_merge_cells', 'doksoft_table_merge_cell_right', 'doksoft_table_merge_cell_down' ] },
			{ name: 'splittables', items: [ 'doksoft_table_split_cell_hor', 'doksoft_table_split_cell_vert'] },

			'/',
			{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike' ] },
			{ name: 'justify', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]},
			{ name: 'lists', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent' ]},
			{ name: 'scritps', items: [ 'Subscript', 'Superscript']},
			{ name: 'document', items: [ 'Sourcedialog']}
		],
		qtRows: 4, // Count of rows
		qtColumns: 5, // Count of columns
		qtBorder: '0', // Border of inserted table
		qtWidth: '100%', // Width of inserted table
		//qtStyle: { 'border-collapse' : 'collapse' },
		qtClass: 'border', // Class of table
		qtCellPadding: '0', // Cell padding table
		qtCellSpacing: '0', // Cell spacing table
		//qtPreviewBorder: '4px double black', // preview table border
		//qtPreviewSize: '4px', // Preview table cell size
		//qtPreviewBackground: '#c8def4' // preview table background (hover)
	}

}