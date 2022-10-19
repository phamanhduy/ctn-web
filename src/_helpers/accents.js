function str_replace(search, replace, str) {
  var ra = replace instanceof Array, sa = str instanceof Array, l = (search = [].concat(search)).length, replace = [].concat(replace), i = (str = [].concat(str)).length;
  let j;
  while (j = 0, i--)
    while (str[i] = str[i].split(search[j]).join(ra ? replace[j] || "" : replace[0]), ++j < l);
  return sa ? str : str[0];
}

export const removeVietnameseAccents = (str) => {
  const accents_arr = new Array(
    "à", "á", "ạ", "ả", "ã", "â", "ầ", "ấ", "ậ", "ẩ", "ẫ", "ă",
    "ằ", "ắ", "ặ", "ẳ", "ẵ", "è", "é", "ẹ", "ẻ", "ẽ", "ê", "ề",
    "ế", "ệ", "ể", "ễ",
    "ì", "í", "ị", "ỉ", "ĩ",
    "ò", "ó", "ọ", "ỏ", "õ", "ô", "ồ", "ố", "ộ", "ổ", "ỗ", "ơ",
    "ờ", "ớ", "ợ", "ở", "ỡ",
    "ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ",
    "ỳ", "ý", "ỵ", "ỷ", "ỹ",
    "đ",
    "À", "Á", "Ạ", "Ả", "Ã", "Â", "Ầ", "Ấ", "Ậ", "Ẩ", "Ẫ", "Ă",
    "Ằ", "Ắ", "Ặ", "Ẳ", "Ẵ",
    "È", "É", "Ẹ", "Ẻ", "Ẽ", "Ê", "Ề", "Ế", "Ệ", "Ể", "Ễ",
    "Ì", "Í", "Ị", "Ỉ", "Ĩ",
    "Ò", "Ó", "Ọ", "Ỏ", "Õ", "Ô", "Ồ", "Ố", "Ộ", "Ổ", "Ỗ", "Ơ",
    "Ờ", "Ớ", "Ợ", "Ở", "Ỡ",
    "Ù", "Ú", "Ụ", "Ủ", "Ũ", "Ư", "Ừ", "Ứ", "Ự", "Ử", "Ữ",
    "Ỳ", "Ý", "Ỵ", "Ỷ", "Ỹ",
    "Đ"
  );

  const no_accents_arr = new Array(
    "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a",
    "a", "a", "a", "a", "a", "a",
    "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e",
    "i", "i", "i", "i", "i",
    "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o",
    "o", "o", "o", "o", "o",
    "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u",
    "y", "y", "y", "y", "y",
    "d",
    "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A",
    "A", "A", "A", "A", "A",
    "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E",
    "I", "I", "I", "I", "I",
    "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O",
    "O", "O", "O", "O", "O",
    "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U",
    "Y", "Y", "Y", "Y", "Y",
    "D"
  );

  return str_replace(accents_arr, no_accents_arr, str);
}

export const decodeHtmlEntitiesSupport = str => {
  const accents_arr = new Array(
    '&lt;br&gt;', '&lt;/br&gt;', '&lt;p&gt;', '&lt;/p&gt;', '&lt;strong&gt;', '&lt;/strong&gt;',
    '&lt;b&gt;', '&lt;/b&gt;', '&lt;i&gt;', '&lt;/i&gt;',
  );
  const no_accents_arr = new Array(
    '<br>', '</br>', '<p>', '</p>', '<strong>', '</strong>',
    '<b>', '</b>', '<i>', '</i>',
  );
  const newStr = str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
  return str_replace(accents_arr, no_accents_arr, newStr);
}
